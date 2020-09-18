import React, {Component} from 'react';
import {
  StyleSheet,
  Keyboard,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import {Layout, Text, Button} from '@ui-kitten/components';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {
  ButtonSpinner,
  InputField,
  onValidationError,
} from '../../../util/TextInputUI';
import FormStyles from '../../../util/FormStyles';
import {Item} from '../../../util/DataObjects';
import * as yup from 'yup';
import {MergeState, StoreData} from '../../../util/UtilityMethods';
import {SplitSlider} from '../../../util/ComponentUtil';
import {
  getKeyForCurrentGroupItems,
  isPossibleObjectEmpty,
  LocalData,
} from '../../../util/LocalData';
import Animated, {Easing} from 'react-native-reanimated';

const SLIDER_SHOW = Dimensions.get('window').height - 420;
const SLIDER_HIDE = Math.round(SLIDER_SHOW * 0.4);

export default class NewItem extends Component {
  constructor(props) {
    super(props);
    this.passedItem = this.props.route.params.item;
    this.vrIndex = this.props.route.params.vrIndex;
    this.state = {
      itemCost: this.passedItem.itemCost
        ? this.passedItem.itemCost.toString()
        : '',
      itemCostError: '',
      itemName: this.passedItem.itemName,
      itemNameError: '',
      isSubmitting: false,
      renderHeight: new Animated.Value(SLIDER_SHOW),
    };
    this.scrollExpanded = true;
    this.itemNameRef = React.createRef();
    this.itemCostRef = React.createRef();
    this.validationSchema = yup.object().shape({
      itemCost: yup
        .string()
        .test('is-number', 'Cost must be a number', function(value) {
          return !isNaN(value);
        })
        .label('Cost')
        .required(),
      itemName: yup
        .string()
        .label('Item')
        .required(),
    });

    this.itemSplitPercent =
      this.passedItem == null ? {} : this.passedItem.itemSplit;
    this.groupMemberIds = Object.keys(LocalData.currentGroup.members);
  }

  componentDidMount() {
    console.log('Arrived at NewItem!');
    this.keyboardDidShowSub = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardDidShow,
    );
    this.keyboardDidHideSub = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide,
    );
  }

  async componentWillUnmount() {
    this.keyboardDidShowSub.remove();
    this.keyboardDidHideSub.remove();
  }

  keyboardDidShow = () => {
    this.toggleAnim();
  };

  keyboardDidHide = () => {
    this.toggleAnim();
  };

  toggleAnim() {
    const {renderHeight} = this.state;
    Animated.timing(renderHeight, {
      duration: 100,
      toValue: this.scrollExpanded ? SLIDER_HIDE : SLIDER_SHOW,
      easing: Easing.inOut(Easing.linear),
    }).start();
    this.scrollExpanded = !this.scrollExpanded;
  }

  render() {
    this.splitSliders = this.groupMemberIds.map(userId => {
      return (
        <SplitSlider
          key={userId}
          sliderLabel={Styles.sliderLabel}
          sliderStyle={Styles.slider}
          sliderContainer={Styles.sliderContainer}
          minimumValue={0}
          maximumValue={100}
          value={
            isPossibleObjectEmpty(this.itemSplitPercent)
              ? Math.round(10000 / this.groupMemberIds.length) / 100
              : this.itemSplitPercent[userId]
          }
          step={1}
          userId={userId}
          objectInstance={this}
        />
      );
    });
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Layout style={Styles.container}>
          <SafeAreaView style={Styles.container}>
            <Layout style={Styles.titleContainer}>
              <Text style={Styles.titleText} category="h4">
                Item Editor
              </Text>
            </Layout>
            <Layout>
              <InputField
                fieldError={this.state.itemNameError}
                refToPass={this.itemNameRef}
                validationSchema={this.validationSchema}
                fieldKey="itemName"
                fieldParams={text => ({itemName: text})}
                setField={value => MergeState(this, {itemName: value})}
                setFieldError={value =>
                  MergeState(this, {itemNameError: value})
                }
                placeholder="item"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
                value={this.state.itemName}
                autoFocus={this.vrIndex == null}
              />
              <InputField
                fieldError={this.state.itemCostError}
                refToPass={this.itemCostRef}
                validationSchema={this.validationSchema}
                fieldKey="itemCost"
                fieldParams={text => ({itemCost: text})}
                setField={value => MergeState(this, {itemCost: value})}
                setFieldError={value =>
                  MergeState(this, {itemCostError: value})
                }
                placeholder="cost"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
                value={this.state.itemCost}
              />
            </Layout>
            <Animated.View
              style={[
                Styles.scrollContainer,
                {height: this.state.renderHeight},
              ]}>
              <ScrollView style={Styles.scrollView}>
                {this.splitSliders}
              </ScrollView>
            </Animated.View>
            <Layout style={FormStyles.buttonStyle}>
              <Button
                style={FormStyles.button}
                onPress={() => this.props.navigation.goBack()}
                appearance="outline">
                Go back
              </Button>
              {this.state.isSubmitting ? (
                <Button
                  style={FormStyles.button}
                  accessoryLeft={ButtonSpinner}
                  appearance="ghost"
                />
              ) : (
                <Button
                  style={FormStyles.button}
                  onPress={() => {
                    MergeState(this, {isSubmitting: true});
                    this.validationSchema
                      .validate({
                        itemName: this.state.itemName,
                        itemCost: this.state.itemCost,
                      })
                      .catch(error =>
                        onValidationError(error, [
                          [this.itemNameRef, this.state.itemName],
                          [this.itemCostRef, this.state.itemCost],
                        ]),
                      )
                      .then(valid => {
                        const total = Math.round(
                          Object.values(this.itemSplitPercent).reduce(
                            (a, b) => a + b,
                            0,
                          ),
                        );
                        if (valid) {
                          if (total !== 100) {
                            MergeState(this, {isSubmitting: false});
                            Alert.alert(
                              'Percentage Error',
                              'The individual percentages only add up to ' +
                                total +
                                '%. Make sure they add up to 100%.',
                            );
                          } else {
                            const UpdatedItem = new Item(
                              this.state.itemName,
                              Number(this.state.itemCost),
                              this.itemSplitPercent,
                            );
                            if (this.vrIndex != null) {
                              LocalData.items[this.vrIndex] = UpdatedItem;
                            } else {
                              LocalData.items.push(UpdatedItem);
                            }
                            LocalData.items = LocalData.items.filter(
                              item => item != null,
                            );
                            StoreData(
                              getKeyForCurrentGroupItems(),
                              LocalData.items,
                            );
                            LocalData.container.forceUpdate();
                            setTimeout(
                              () => this.props.navigation.goBack(),
                              500,
                            );
                          }
                        } else {
                          MergeState(this, {isSubmitting: false});
                        }
                      });
                  }}>
                  Save
                </Button>
              )}
            </Layout>
          </SafeAreaView>
        </Layout>
      </TouchableWithoutFeedback>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  sliderLabel: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  slider: {
    justifyContent: 'center',
    width: Dimensions.get('window').width * 0.6,
    height: 50,
  },
  sliderContainer: {
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingTop: 10,
  },
  scrollContainer: {
    width: Dimensions.get('window').width,
    marginTop: 20,
    borderColor: 'lightgray',
  },
  titleText: {
    marginTop: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width,
  },
});

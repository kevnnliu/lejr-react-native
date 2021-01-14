import React, {Component} from 'react';
import {
  Dimensions,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import {Button, Layout, Text} from '@ui-kitten/components';
import {
  ButtonSpinner,
  InputField,
  onValidationError,
} from '../../../util/TextInputUI';
import {
  getTotal,
  JSONCopy,
  MergeState,
  nearestHundredth,
} from '../../../util/UtilityMethods';
import FormStyles from '../../../util/FormStyles';
import * as yup from 'yup';
import {
  deleteAllItems,
  LocalData,
  uploadVirtualReceipt,
} from '../../../util/LocalData';
import {PurchaseSplit, TwoColCheck} from '../../../util/ContributionUI';
import {AnimKeyboardDuration, Screen} from '../../../util/Constants';
import {ScrollView} from 'react-native-gesture-handler';
import {Item, VirtualReceipt} from '../../../util/DataObjects';
import {Fragment} from 'react';

export default class QuickAdd extends Component {
  constructor() {
    super();
    this.state = {
      memo: '',
      memoError: '',
      total: '',
      totalError: '',
      isSubmitting: false,
    };
    this.memoRef = React.createRef();
    this.totalRef = React.createRef();
    this.validationSchema = yup.object().shape({
      memo: yup
        .string()
        .label('Memo')
        .required(),
      total: yup
        .string()
        .test('is-number', 'Cost must be a number', function(value) {
          return !isNaN(value);
        })
        .label('Total')
        .required(),
    });

    this.splitPercent = {};
    this.splitCheck = {};

    this.groupMemberIds = Object.keys(LocalData.currentGroup.members);

    this.groupMemberIds.forEach(userId => {
      this.splitPercent[userId] =
        Math.round(10000 / this.groupMemberIds.length) / 100;
      this.splitCheck[userId] = 1;
    });
  }

  componentDidMount() {
    console.log('Arrived at QuickAdd!');
  }

  checkboxCallback(nextChecked, checkedUserId) {
    this.splitCheck[checkedUserId] = nextChecked ? 1 : 0;
    var splitValue =
      Math.round(10000 / getTotal(Object.values(this.splitCheck))) / 100;
    Object.keys(this.splitPercent).forEach(userId => {
      this.splitPercent[userId] = this.splitCheck[userId] * splitValue;
    });
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Layout style={Styles.container}>
          <SafeAreaView style={Styles.container}>
            <Layout>
              <Text style={Styles.titleText} category="h4">
                Quick Add Purchase
              </Text>
            </Layout>
            <Layout>
              <InputField
                fieldError={this.state.memoError}
                refToPass={this.memoRef}
                validationSchema={this.validationSchema}
                fieldKey="memo"
                fieldParams={text => ({memo: text})}
                setField={value => MergeState(this, {memo: value})}
                setFieldError={value => MergeState(this, {memoError: value})}
                placeholder="memo"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
                value={this.state.memo}
                autoFocus={!this.state.memo}
              />
              <InputField
                fieldError={this.state.totalError}
                refToPass={this.totalRef}
                validationSchema={this.validationSchema}
                fieldKey="total"
                fieldParams={text => ({total: text})}
                setField={value => MergeState(this, {total: value})}
                setFieldError={value => MergeState(this, {totalError: value})}
                placeholder="total"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
                value={this.state.total}
                keyboardType="numeric"
              />
            </Layout>
            <Layout style={Styles.infoContainer}>
              <Text style={Styles.centerText}>
                Purchased by{' '}
                {LocalData.currentVR
                  ? LocalData.currentGroup.members[LocalData.currentVR.buyerId]
                      .name
                  : LocalData.currentGroup.members[LocalData.user.userId].name}
              </Text>
              <Text style={Styles.subtitle} category="h6">
                Item Split
              </Text>
            </Layout>
            <ScrollView style={Styles.scrollView}>
              {this.groupMemberIds.map(userId => {
                return (
                  <Fragment key={userId}>
                    <TwoColCheck
                      isChecked={this.splitCheck[userId] === 1}
                      callback={nextChecked =>
                        this.checkboxCallback(nextChecked, userId)
                      }
                      text={LocalData.currentGroup.members[userId].name}
                    />
                  </Fragment>
                );
              })}
            </ScrollView>
            <Layout style={FormStyles.buttonStyle}>
              <Button
                disabled={this.state.isSubmitting}
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
                        memo: this.state.memo,
                        total: this.state.total,
                      })
                      .catch(error =>
                        onValidationError(error, [
                          [this.memoRef, this.state.memo],
                          [this.totalRef, this.state.total],
                        ]),
                      )
                      .then(valid => {
                        if (valid) {
                          uploadVirtualReceipt(
                            new VirtualReceipt(
                              LocalData.user.userId,
                              '',
                              this.state.memo,
                              Date.now(),
                              [
                                new Item(
                                  'QUICK ADD ITEM',
                                  parseFloat(this.state.total),
                                  this.splitPercent,
                                  '',
                                ),
                              ],
                              parseFloat(this.state.total),
                              this.splitPercent,
                              '',
                            ),
                            () => {
                              deleteAllItems();
                              LocalData.currentVR = null;
                              LocalData.currentVRCopy = null;
                              setTimeout(
                                () =>
                                  this.props.navigation.navigate(
                                    Screen.DashboardMain,
                                    {screen: Screen.Home},
                                  ),
                                AnimKeyboardDuration,
                              );
                            },
                            error => {
                              console.error('Received error: ' + error);
                              MergeState(this, {isSubmitting: false});
                            },
                          );
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
  scrollView: {
    flex: 1,
    width: Dimensions.get('window').width,
    marginTop: 10,
  },
  titleText: {
    marginTop: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  centerText: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 15,
    textDecorationLine: 'underline',
  },
  infoContainer: {
    marginTop: 20,
  },
});
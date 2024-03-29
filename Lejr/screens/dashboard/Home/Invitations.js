import React, {Fragment} from 'react';
import {StyleSheet, SafeAreaView, Alert} from 'react-native';
import {Text, Layout, Button} from '@ui-kitten/components';
import {Collection, ErrorCode, Key, Screen} from '../../../util/Constants';
import {
  LocalData,
  joinGroup,
  isPossibleObjectEmpty,
  swapGroup,
} from '../../../util/LocalData';
import {
  CustomSwipeable,
  DangerSwipe,
  SuccessSwipe,
  ThemedCard,
  ThemedScroll,
} from '../../../util/ComponentUtil';
import {Component} from 'react';
import Animated from 'react-native-reanimated';
import {BlankCard, ItemCard} from '../../../util/ContributionUI';
import firestore from '@react-native-firebase/firestore';
import {AcceptIcon, DenyIcon} from '../../../util/Icons';
import {warnLog} from '../../../util/UtilityMethods';

export default class Invitations extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    console.log('Arrived at Invitations!');
    LocalData.invScreen = this;
    this._mounted = true;
  }

  componentWillUnmount() {
    this._mounted = false;
    if (LocalData.setInvCount != null) {
      LocalData.setInvCount(LocalData.invitations.length);
      console.log('Invitation count updated');
    }
  }

  render() {
    return (
      <Layout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          <Layout style={Styles.titleContainer}>
            <Text style={Styles.titleText} category="h4">
              Invitations
            </Text>
            {isPossibleObjectEmpty(LocalData.invitations) ? (
              <Text style={Styles.text} appearance="hint">
                No invitations yet.
              </Text>
            ) : (
              <Text style={Styles.text} appearance="hint">
                Swipe right to accept, left to delete.
              </Text>
            )}
          </Layout>
          <Layout style={Styles.listContainer}>
            <ThemedScroll
              style={Styles.justFlex}
              contentContainerStyle={Styles.contentContainer}>
              {LocalData.invitations.map((item, index) => {
                if (item != null) {
                  return (
                    <Fragment key={index}>
                      {new InvitationCard({
                        item: item,
                        index: index,
                        navigation: this.props.navigation,
                      }).render()}
                    </Fragment>
                  );
                }
              })}
              <BlankCard />
            </ThemedScroll>
          </Layout>
          <Layout style={Styles.buttonContainer}>
            <Button
              onPress={() => this.props.navigation.goBack()}
              appearance="outline">
              Go back
            </Button>
          </Layout>
        </SafeAreaView>
      </Layout>
    );
  }
}

function removeInvitation(component) {
  LocalData.invShouldUpdate = LocalData.invitations.length <= 1 ? true : false;
  firestore()
    .collection(Collection.Users)
    .doc(LocalData.user.userId)
    .collection(Key.Invitations)
    .doc(component.item.groupId)
    .delete()
    .then(() => {
      console.log('Removed invitation ' + component.item.groupId);
    });
}

class InvitationCard extends ItemCard {
  constructor(props) {
    super(props);
    this.RENDER_HEIGHT = 72;

    this.item = props.item;
    this.index = props.index;
    this.navigation = props.navigation;
    this.swipeableRef = React.createRef();

    this.state = {
      renderScaleY: new Animated.Value(1),
      offsetY: new Animated.Value(this.RENDER_HEIGHT),
    };
  }

  renderRightActions = () => {
    return (
      <DangerSwipe
        animStyle={{
          height: this.state.offsetY,
          scaleY: this.state.renderScaleY,
        }}
        style={Styles.card}
        renderLabel="Delete"
      />
    );
  };
  renderLeftActions = () => {
    return (
      <SuccessSwipe
        animStyle={{
          height: this.state.offsetY,
          scaleY: this.state.renderScaleY,
        }}
        style={Styles.card}
        renderLabel="Accept"
      />
    );
  };

  render() {
    return (
      <Animated.View
        style={{
          height: this.state.offsetY,
          scaleY: this.state.renderScaleY,
        }}>
        <CustomSwipeable
          childrenContainerStyle={{height: this.RENDER_HEIGHT}}
          ref={this.swipeableRef}
          renderRightActions={this.renderRightActions}
          renderLeftActions={this.renderLeftActions}
          onSwipeableWillOpen={() => {
            this.closeAnim();
          }}
          onSwipeableRightOpen={() => {
            removeInvitation(this);
          }}
          onSwipeableLeftOpen={() => {
            joinGroup(this.item.groupId).then(
              () => {
                removeInvitation(this);
                swapGroup(this.item.groupId, () =>
                  this.navigation.navigate(Screen.Loading),
                );
              },
              error => {
                warnLog(error.message);
                if (error.message !== ErrorCode.DoesNotExist) {
                  Alert.alert(
                    'Join Group Error',
                    'Failed to join group. Please try again.',
                  );
                }
              },
            );
          }}>
          <ThemedCard style={Styles.card} enabled={false}>
            <Layout style={Styles.innerContainer}>
              <AcceptIcon />
              <Text style={Styles.text} numberOfLines={2}>
                {this.item.fromName} invited you to {this.item.groupName}
              </Text>
              <DenyIcon />
            </Layout>
          </ThemedCard>
        </CustomSwipeable>
      </Animated.View>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listContainer: {
    flex: 5,
    width: '100%',
  },
  titleContainer: {
    marginVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  justFlex: {
    flex: 1,
  },
  buttonContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  card: {
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 10,
  },
  text: {
    textAlign: 'center',
  },
});

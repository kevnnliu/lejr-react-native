import React from 'react';
import {StyleSheet, SafeAreaView, Alert} from 'react-native';
import {Text, Layout, Button, Icon} from '@ui-kitten/components';
import {ErrorCode} from '../../../util/Constants';
import {
  LocalData,
  pushUserData,
  joinGroup,
  isPossibleObjectEmpty,
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
import {ItemCard} from '../../../util/ContributionUI';

const AcceptIcon = props => <Icon name="checkmark-outline" {...props} />;
const DenyIcon = props => <Icon name="close-outline" {...props} />;

export default class Invitations extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    console.log('Arrived at Invitations!');
  }

  render() {
    return (
      <Layout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          <Layout style={Styles.titleContainer}>
            <Text style={Styles.titleText} category="h4">
              Invitations
            </Text>
          </Layout>
          <Layout style={Styles.listContainer}>
            {isPossibleObjectEmpty(LocalData.user.invites) ? (
              <Layout style={Styles.container}>
                <Text style={Styles.text} appearance="hint">
                  No invitations
                </Text>
              </Layout>
            ) : (
              <ThemedScroll
                style={Styles.list}
                contentContainerStyle={Styles.contentContainer}>
                {LocalData.user.invites.map((item, index) => {
                  if (item != null) {
                    return (
                      <InvitationCard key={index} item={item} index={index} />
                    );
                  }
                })}
              </ThemedScroll>
            )}
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

function removeInvitation(index, component) {
  LocalData.user.invites.splice(index, 1);
  pushUserData();
  component.forceUpdate();
  console.log('Removed invitation ' + index);
}

class InvitationCard extends ItemCard {
  constructor(props) {
    super(props);
    this.RENDER_HEIGHT = 72;

    this.item = props.item;
    this.index = props.index;
    this.swipeableRef = React.createRef();

    this.state = {
      renderScaleY: new Animated.Value(1),
      offsetY: new Animated.Value(this.RENDER_HEIGHT),
    };
  }

  renderRightActions = () => {
    return <DangerSwipe style={Styles.card} renderLabel="Slide to delete" />;
  };
  renderLeftActions = () => {
    return <SuccessSwipe style={Styles.card} renderLabel="Slide to accept" />;
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
            this.closeSwipeable();
            removeInvitation(this.index, this);
          }}
          onSwipeableLeftOpen={() => {
            this.closeSwipeable();
            joinGroup(this.item.groupId).then(
              () => {
                removeInvitation(this.index, this);
                this.props.navigation.popToTop();
              },
              error => {
                console.warn(error.message);
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
  list: {
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
    paddingHorizontal: 8,
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 5,
  },
});

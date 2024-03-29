import React, {Component} from 'react';
import {Keyboard, TouchableWithoutFeedback, SafeAreaView} from 'react-native';
import {Layout, Text, Button} from '@ui-kitten/components';
import FormStyles from '../../../util/FormStyles';
import {
  onValidationError,
  InputField,
  ButtonSpinner,
} from '../../../util/TextInputUI';
import * as yup from 'yup';
import {Screen, ErrorCode} from '../../../util/Constants';
import {StyleSheet} from 'react-native';
import {pushInvite, LocalData} from '../../../util/LocalData';
import {warnLog} from '../../../util/UtilityMethods';
import QRCode from 'react-qr-code';

export default class InviteToGroup extends Component {
  constructor(props) {
    super();
    this.state = {
      isInviting: false,
      message: '',
      textStatus: 'success',
      email: '',
      emailError: '',
    };
    this.emailRef = React.createRef();
    this.validationSchema = yup.object().shape({
      email: yup
        .string()
        .label('Email')
        .email()
        .required(),
    });
  }

  componentDidMount() {
    console.log('Arrived at InviteToGroup');
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Layout style={Styles.container}>
          <SafeAreaView style={Styles.container}>
            <Layout style={FormStyles.buttonStyle}>
              <Button
                style={FormStyles.button}
                onPress={() => this.props.navigation.goBack()}
                appearance="outline">
                Back
              </Button>
              {/* <Layout>
                {this.state.isInviting ? (
                  <Button
                    style={FormStyles.button}
                    accessoryLeft={ButtonSpinner}
                    appearance="ghost"
                  />
                ) : (
                  <Button
                    style={FormStyles.button}
                    onPress={() => {
                      this.validationSchema
                        .validate({email: this.state.email})
                        .catch(error =>
                          onValidationError(error, [
                            [this.emailRef, this.state.email],
                          ]),
                        )
                        .then(valid => {
                          if (valid) {
                            this.setState({isInviting: true});
                            var newState = {};
                            pushInvite(
                              LocalData.user.name,
                              this.state.email,
                              () => {
                                newState.textStatus = 'success';
                                newState.message = 'Invite sent!';
                                this.emailRef.current.clear();
                                newState.isInviting = false;
                                this.setState(newState);
                              },
                            ).catch(error => {
                              warnLog(error.message);
                              switch (error.message) {
                                case ErrorCode.UserDuplicate:
                                  newState.textStatus = 'warning';
                                  newState.message = 'User already in group!';
                                  break;

                                case ErrorCode.UserNotFound:
                                  newState.textStatus = 'warning';
                                  newState.message = 'User not found!';
                                  break;

                                default:
                                  newState.textStatus = 'danger';
                                  newState.message = 'Invite failed!';
                                  break;
                              }
                              newState.isInviting = false;
                              this.setState(newState);
                            });
                          }
                        });
                    }}>
                    Invite
                  </Button>
                )}
              </Layout> */}
            </Layout>
            <Layout style={FormStyles.fieldStyle}>
              {/* <Text style={Styles.text} status={this.state.textStatus}>
                {this.state.message}
              </Text>
              <InputField
                fieldError={this.state.emailError}
                refToPass={this.emailRef}
                validationSchema={this.validationSchema}
                fieldKey="email"
                fieldParams={text => ({email: text})}
                setField={value => this.setState({email: value})}
                setFieldError={value => this.setState({emailError: value})}
                placeholder="username@email.com"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
                value={this.state.email}
                autoFocus
              /> */}
              <Text style={Styles.text}>
                Use Lejr to scan this QR code and join{' '}
                {LocalData.currentGroup.groupName}.
              </Text>
              <QRCode value={LocalData.currentGroup.groupId} />
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
    flexDirection: 'column-reverse',
  },
  text: {
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 30,
  },
});

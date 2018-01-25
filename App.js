import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { AuthSession, SecureStore } from 'expo';

import HomeScreen from './App/HomeScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 30,
  },
});

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      token: null,
    };
  }

  async componentWillMount() {
    let token;
    try {
      token = await SecureStore.getItemAsync('token');
    } catch (e) {
      // pass
    }
    if (token) {
      this.setState({ token });
    }
  }

  handlePress = async () => {
    const redirectUrl = AuthSession.getRedirectUrl();
    const result = await AuthSession.startAsync({
      authUrl:
        'https://swipeydoo.glitch.me' +
        `?redirect_uri=${encodeURIComponent(redirectUrl)}`,
    });
    this.setState({
      token: result.params.access_token,
    }, async () => {
      await SecureStore.setItemAsync('token', result.params.access_token);
    });
  }
  render() {
    return (
      <Choose>
        <When condition={this.state.token}>
          <HomeScreen token={this.state.token} />
        </When>
        <Otherwise>
          <View style={styles.container}>
            <Text style={styles.title}>Swipeydoo</Text>
            <Button title="Sign in with GitHub" onPress={this.handlePress}/>
          </View>
        </Otherwise>
      </Choose>
    );
  }
}

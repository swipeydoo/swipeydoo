import React from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import { AuthSession, SecureStore } from 'expo';
import client from 'simple-graphql-client'


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

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      reviewRequests: [],
    };
  }

  async componentWillMount() {
    // fetch requested reviews with node-github
    const query = client('https://api.github.com/graphql', {
      headers: {
        Authorization: `Bearer ${this.props.token}`,
      },
    });
    const userRes = await query(`
      {
        viewer {
          login
        }
      }
      `);
    const reviewsRes = await query(`
      query($q: String!) {
        search(query: $q, type: ISSUE, first: 10) {
          edges {
            node {
              ... on PullRequest {
                title
                id
                author {
                  avatarUrl
                  login
                  url
                }
              }
            }
          }
        }
      }
      `, {
      q: `is:open is:pr review-requested:${userRes.viewer.login} archived:false`,
    });
    this.setState({ reviewRequests: reviewsRes.search.edges });
  }


  render() {
    return (
      <View style={styles.container}>
        {this.state.reviewRequests.map(reviewRequest => (
          <View key={reviewRequest.node.id}>
            <Image
              style={{ width: 50, height: 50 }}
              source={{ uri: reviewRequest.node.author.avatarUrl }}
            />
            <Text>{reviewRequest.node.title}</Text>
          </View>
        ))}
      </View>
    );
  }
}


"use strict";

// If you want to use AWS...
const AWS = require('aws-sdk');
const credentials = AWS.config.credentials;

global.WebSocket = require('ws');
require('es6-promise').polyfill();
require('isomorphic-fetch');

// Require AppSync module
const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;

const type = AUTH_TYPE.AWS_IAM;


// Import gql helper
const gql = require('graphql-tag');

// Set up Apollo client
const client = new AWSAppSyncClient({
    url: process.env.GRAPHQL_API_URL,
    region: process.env.REGION,
    auth: {
        type: type,
        credentials: credentials,
    },
    disableOffline: true      //Uncomment for AWS Lambda
});

    const updateListing = gql `mutation UpdateListing($input: UpdateListingInput!) {
  updateListing(input: $input) {
    id
    title
    company
    url
    status
    favorite
    notes
    relatedDate
    contactName
    contactEmail
    contactPhoneNumber
    createdAt
    updatedAt
  }
}`;

  const vari = {
              id: "018a367e-f6d9-4387-8266-8ffc398548cb",
              notes: "Pile up  of Notes!"
  };

exports.handler = (event, context, callback) => {
        console.log('Going to invoke mutate with vari =  -----------> ' + vari);
client.hydrated().then(function (client) {
    //Now run a query
    //client.query({ query: query })
    //client.query({ query: query, fetchPolicy: 'network-only' })   //Uncomment for AWS Lambda
     //   .then(function logData(data) {
      //      console.log('results of query: ', data);
       // })
       // .catch(console.error);
    client.mutate({ mutation: updateListing, variables:{input: vari} })
    .then(function logData(data) {
        console.log('(Mutate): Updated Listing Data ----------->', data);
    })
    .catch(console.error);

});
    
    /*await client.mutate({
      updateListing,
      variables: {
        input: {
              id: "018a367e-f6d9-4387-8266-8ffc398548cb",
              notes: "Nothing at all!"
        }
      }
    });*/
    /*const mutation = gql`mutation Test($value: String!) {
          test(value: $value)
        }`;
    await graphqlClient.mutate({
      mutation,
      variables: {
        value: 'test'
      }
    });*/
        const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!')
    };
    return response;
};


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

const createAlert = gql `mutation CreateAlert($input: CreateAlertInput!) {
  createAlert(input: $input) {
    id
    sourceObject
    type
    severity
    title
    notes
    createdAt
    updatedAt
  }
}
`;
const vari = {
 sourceObject: "somedevice"
 type: "WATER_LEAK"
 severity: "MAJOR"
 title: "Serious issue in Room"  
};
exports.handler = (event, context, callback) => {
        console.log('Going to invoke create mutate with  -----------> ');
client.hydrated().then(function (client) {
    client.mutate({ mutation: createAlert, variables: {input: vari}} })
    .then(function logData(data) {
        console.log('(Mutate): Create Alert Data ----------->', data);
    })
    .catch(console.error);

});
    
        const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!')
    };
    return response;
};

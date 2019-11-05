"use strict";
console.log('starting function');


// If you want to use AWS...
const AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({region : 'us-east-1'});
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

const updateSensorRoomData = gql `mutation UpdateSensorRoomData($input: UpdateSensorRoomDataInput!) {
  updateSensorRoomData(input: $input) {
    id
    flowRate
  }
}
`;

exports.handler = (event, context, callback) => {
      event.Records.forEach(function(record) {
        // Kinesis data is base64 encoded so decode here
        var payload = Buffer.from(record.kinesis.data, 'base64').toString('ascii');
        console.log('Decoded payload:', payload);
        var recv = JSON.parse(payload);
            var tableName = "Sensor";   
            var sensorId = recv["THING"];
            var flowRate = parseInt(recv["FLOWRATE"]);
            console.log('Decoded thing:', sensorId);
            console.log('Decoded flowRate:', flowRate);
  const updateVari = {
              id: sensorId,
              flowRate: flowRate
  };
        console.log('Going to invoke update mutate with vari =  -----------> ' + updateVari);
client.hydrated().then(function (client) {
    client.mutate({ mutation: updateSensorRoomData, variables:{input: updateVari} })
    .then(function logData(data) {
        console.log('(Mutate): Updated SensorRoomData ----------->', data);
    })
    .catch(console.error);

});
    });

    callback(null, `Successfully processed ${event.Records.length} records.`);
}

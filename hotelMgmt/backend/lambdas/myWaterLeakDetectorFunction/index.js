
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

var sns = new AWS.SNS();

var FLOW_THRESHOLD = 50;
const ALARM_TYPE_WATERLEAK = "WATER_LEAK";

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

const createAlert = gql`mutation CreateAlert($input: CreateAlertInput!) {
  createAlert(input: $input) {
    id
    sourceObject
    type
    severity
    title
  }
}
`;

const deleteAlert = gql `mutation DeleteAlert($input: DeleteAlertInput!) {
    deleteAlert(input: $input) {
      id
    }
  }
  `;

let isFlowing = function (newFlowrate) {
    console.log('typeof Newflowrate is' + newFlowrate);
    //var flow = parseInt(newFlowrate);
    //var flowRate = Number(parseInt(newFlowrate));
    //console.log('Flowrate is' + flow + ', ' + typeof(flow));
    if (newFlowrate == 100) {
        console.log("There IS flow");
        return true;
    }

    console.log("There is NO flow");
    return false;

}

let hasAlerted = function (sensorId, roomId, alarmType) {
    // read dynamodb Alerts table to find out
    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

    var table = "Alarms";

    var params = {
        TableName: table,
        Key: {
            "sensorId": sensorId
        }
    };

    docClient.get(params, function (err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));

            if (data.Item.sensorId == null) {
                console.log("No alarm exists");
                return false;
            } else {
                console.log("Alarm exists");
                return true;
            }
        }
    });

}

let createAlarm = function (sensorId, roomId, alarmType) {

    console.log("Adding a new item...");

    const vari = {
        id: sensorId,
        sourceObject: sensorId,
        type: alarmType,
        severity: "CRITICAL",
        title: "Serious issue in Room number " + roomId,
        notes: "Needs immediate action from personnel!!!"
    };

    console.log('Going to invoke mutate with vari =  -----------> ' + vari);
    client.hydrated().then(function (client) {
        client.mutate({ mutation: createAlert, variables: { input: vari } })
            .then(function logData(data) {
                console.log('(Mutate): Created Alert Data ----------->', data);
                postAlertMessage(sensorId, roomId, alarmType, true);
            })
            .catch(console.error);

    });

}

let deleteAlarm = function (sensorId, roomId, alarmType) {

    console.log("Attempting a conditional delete...");
    const vari = {
        id: sensorId
    };

    console.log('Going to invoke delete mutation with vari =  -----------> ' + vari);
    client.hydrated().then(function (client) {
        client.mutate({ mutation: deleteAlert, variables: { input: vari } })
            .then(function logData(data) {
                console.log('(Mutate): Deleted Alert  ----------->', data);
                postAlertMessage(sensorId, roomId, alarmType, false);
            })
            .catch(console.error);

    });

}

let postAlertMessage = function (sensorId, roomId, alarmType, isRaised) {
    var subject = "";
    var message = "";
    if (isRaised) {
        subject = 'Critical Issue at Hotel Aria room number ' + roomId;
        if (alarmType == ALARM_TYPE_WATERLEAK) {
            message = '\n\nWater leak detected in Hotel Aria room number ' + roomId;
        } else {
            message = '\n\nSome issue detected';
        }
    } else {
        subject = 'Issue Resolved at Hotel Aria room number ' + roomId;
        if (alarmType == ALARM_TYPE_WATERLEAK) {
            message = '\n\nWater leak has stopped in Hotel Aria room number ' + roomId;
        } else {
            message = '\n\nIssue is resolved';
        }
    }

    var params = {
        Subject: subject,
        Message: message,
        TopicArn: 'arn:aws:sns:us-east-1:206982232731:MoistureSensorTopic'
    };
    sns.publish(params, function (err, data) {
        if (err) {
            console.error("Unable to send message. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Results from sending message: ", JSON.stringify(data, null, 2));
        }
    });
}


exports.handler = (event, context, callback) => {

    event.Records.forEach((record) => {
        console.log('==========Stream record: ', JSON.stringify(record, null, 2));

        if (record.eventName == 'INSERT') {
            // var who = JSON.stringify(record.dynamodb.NewImage.Username.S);
            // var when = JSON.stringify(record.dynamodb.NewImage.Timestamp.S);
            // var what = JSON.stringify(record.dynamodb.NewImage.Message.S);
            // var params = {
            //     Subject: 'A new bark from ' + who, 
            //     Message: 'Woofer user ' + who + ' barked the following at ' + when + ':\n\n ' + what,
            //     TopicArn: 'arn:aws:sns:region:accountID:wooferTopic'
            // };
            // sns.publish(params, function(err, data) {
            //     if (err) {
            //         console.error("Unable to send message. Error JSON:", JSON.stringify(err, null, 2));
            //     } else {
            //         console.log("Results from sending message: ", JSON.stringify(data, null, 2));
            //     }
            // });
        } else if (record.eventName == 'MODIFY') {
            var sensorId = JSON.stringify(record.dynamodb.NewImage.id.S);
            var roomId = record.dynamodb.NewImage.roomId.N;
            var flowrate = record.dynamodb.NewImage.flowRate.N;
            var occupied = record.dynamodb.NewImage.occupied.BOOL;

            var origFlowrate = JSON.stringify(record.dynamodb.OldImage.flowRate.N);
            var origOccupied = JSON.stringify(record.dynamodb.OldImage.occupied.BOOL);

            var isIssueExisting = isFlowing(flowrate) && !occupied;

            console.log('==========isAlarming: ' + isIssueExisting);

            // read dynamodb Alerts table to find out
            var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

            var table = "Alert-a6vu6lziizbflprigc7ncn7ta4-hotelmgmt";

            var params = {
                TableName: table,
                Key: {
                    "id": sensorId                }
            };

            var putObjectPromise = docClient.get(params).promise();
            putObjectPromise.then(function (data) {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                var alertAlreadyExists = false;
                if (data.Item == null) {
                    console.log("No alarm exists");
                    alertAlreadyExists = false;
                } else {
                    console.log("Alarm exists");
                    alertAlreadyExists = true;
                }
                if (isIssueExisting && !alertAlreadyExists) {
                    console.log("==========Need to create alarm=====");
                    // create alarm
                    createAlarm(sensorId, roomId, ALARM_TYPE_WATERLEAK);
                } else if (!isIssueExisting && alertAlreadyExists) {
                    console.log("==========Need to delete alarm=====");
                    // delete alarm
                    deleteAlarm(sensorId, roomId, ALARM_TYPE_WATERLEAK);
                } else if (isIssueExisting && alertAlreadyExists) {
                    console.log("No action required, since alarm already exists");
                } else if (!isIssueExisting && !alertAlreadyExists) {
                    console.log("No action required since alarm does not exist");
                }
            }).catch(function (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                console.log(err);
            });


        }
    });
    callback(null, `Successfully processed ${event.Records.length} records.`);


};

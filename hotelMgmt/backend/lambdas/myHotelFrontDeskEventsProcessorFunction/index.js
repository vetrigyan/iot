
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
    occupied
  }
}
`;


let updateRoomStatusForSensors = function(sensorId, roomId, roomCheckInStatus) {
    var isOccupied = roomCheckInStatus == 1 ? true : false;
  const updateVari = {
              id: sensorId,
              occupied: isOccupied
  };
        console.log('Going to invoke update mutate with vari =  -----------> ' + updateVari);
client.hydrated().then(function (client) {
    client.mutate({ mutation: updateSensorRoomData, variables:{input: updateVari} })
    .then(function logData(data) {
        console.log('(Mutate): Updated SensorRoomData ----------->', data);
    })
    .catch(console.error);

});
}
    
exports.handler = (event, context, callback) => {
  event.Records.forEach(record => {
    const { body } = record;
    console.log('Body is = ' + body);
    if (body == null) {
      console.log("Empty event received.")
      return {};
    }
    var r = JSON.parse(body);
        r.Records.forEach(function(rec){
            console.log("Inside for loop");
        var roomId1 = parseInt(rec.body.roomOccupancyStatus.roomId);
        var roomCheckInStatus = parseInt(rec.body.roomOccupancyStatus.roomCheckInStatus);
        console.log('Inside for loop... roomId1' + roomId1);
        var tableName = "SensorRoomData-a6vu6lziizbflprigc7ncn7ta4-hotelmgmt";
    
        var params = {
            TableName: tableName,
            IndexName: "roomId-index-copy",
            KeyConditionExpression: "roomId = :v_title",
            ExpressionAttributeValues: { ':v_title': roomId1},
            ProjectionExpression: "id",
            ScanIndexForward: false
        };
        
        var putObjectPromise = docClient.query(params).promise();
        putObjectPromise.then(function(data) {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                var alertExists = false;
                if (data.Items == null) {
                    console.log('No sensor with roomId=' + roomId1 + ' exists');
                } else {
                    console.log("Sensor with roomId exists... will need to iterate and update each TBD");
                    // iterate over sensor records to update the occupied status
                    data.Items.forEach(function(item) {
                      console.log("Inside items loop");
                      var sensorId = item.id;
                      console.log('Invoking updateRoomStatusForSensors...' + sensorId +', ' + roomId1 + 
                      ', ' + roomCheckInStatus);
                      updateRoomStatusForSensors(sensorId, roomId1, roomCheckInStatus);
                    });
                    
                }
        }).catch(function(err) {
                    console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                  console.log(err);
                });
        
      //return {};
    });
    });
    callback(null, `Successfully processed ${event.Records.length} records.`);
}

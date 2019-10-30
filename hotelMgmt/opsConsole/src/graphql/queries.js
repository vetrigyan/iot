/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getSensorRoomData = `query GetSensorRoomData($id: ID!) {
  getSensorRoomData(id: $id) {
    sensorId
    flowRate
    roomId
    occupied
  }
}
`;
export const listSensorRoomDatas = `query ListSensorRoomDatas(
  $filter: ModelSensorRoomDataFilterInput
  $limit: Int
  $nextToken: String
) {
  listSensorRoomDatas(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      sensorId
      flowRate
      roomId
      occupied
    }
    nextToken
  }
}
`;
export const getAlert = `query GetAlert($id: ID!) {
  getAlert(id: $id) {
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
export const listAlerts = `query ListAlerts(
  $filter: ModelAlertFilterInput
  $limit: Int
  $nextToken: String
) {
  listAlerts(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      sourceObject
      type
      severity
      title
      notes
      createdAt
      updatedAt
    }
    nextToken
  }
}
`;

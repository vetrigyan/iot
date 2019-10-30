/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createSensorRoomData = `mutation CreateSensorRoomData($input: CreateSensorRoomDataInput!) {
  createSensorRoomData(input: $input) {
    sensorId
    flowRate
    roomId
    occupied
  }
}
`;
export const updateSensorRoomData = `mutation UpdateSensorRoomData($input: UpdateSensorRoomDataInput!) {
  updateSensorRoomData(input: $input) {
    sensorId
    flowRate
    roomId
    occupied
  }
}
`;
export const deleteSensorRoomData = `mutation DeleteSensorRoomData($input: DeleteSensorRoomDataInput!) {
  deleteSensorRoomData(input: $input) {
    sensorId
    flowRate
    roomId
    occupied
  }
}
`;
export const createAlert = `mutation CreateAlert($input: CreateAlertInput!) {
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
export const updateAlert = `mutation UpdateAlert($input: UpdateAlertInput!) {
  updateAlert(input: $input) {
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
export const deleteAlert = `mutation DeleteAlert($input: DeleteAlertInput!) {
  deleteAlert(input: $input) {
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

import React, { useState } from "react";
import styled from "@emotion/styled";
import {
  FaRegEdit,
  FaRegHeart,
  FaHeart,
  FaRegStickyNote,
  FaExternalLinkAlt,
  FaRegTrashAlt,
  FaRegAddressBook,
  FaRegEnvelope,
  FaPhone
} from "react-icons/fa";


const Alert = styled("div")`
  background-color: #31465f;
  border-radius: 4px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  overflow: hidden;
`;

const JobTitle = styled("h2")`
  color: #ffffff;
  margin-top: 0;
  margin-bottom: 0;
`;

const Company = styled("h3")`
  color: #ffac31;
  margin-top: 0;
  margin-bottom: 24px;
`;

const Icon = styled("button")`
  padding: 8px 10px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  border: none;
  cursor: pointer;
  flex: 1;
  background-color: #55667d;

  &:hover {
    background-color: #31465f;
  }
`;

const StatusContainer = styled("div")`
  min-width: 200px;
  display: flex;
  justify-content: flex-end;
  margin-bottom: auto;

  @media (max-width: 800px) {
    justify-content: flex-start;
  }
`;

const Status = styled("div")`
  background-color: #55667d;
  padding: 6px 12px;
  color: #ffac31;
  border-radius: 3px;
  font-size: 12px;
  display: inline;
  margin-bottom: 4px;
  font-weight: bold;
`;

const DueDate = styled("span")`
  color: #ffac31;
  text-transform: uppercase;
  font-size: 12px;
  display: block;
`;

const AlertInfo = styled("div")``;

const AlertMetaData = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;

  @media (max-width: 800px) {
    flex-direction: column;
    justify-content: flex-start;
  }
`;

const AlertDetails = styled("div")`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 16px;
`;

const AlertDetail = styled("span")`
  color: #ffac31;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Divider = styled("div")`
  height: 1px;
  background-color: #152939;
`;

const ExternalLink = styled("a")`
  color: #ffffff;
  flex: 1;
`;

const STATUSES = {
  TRACKING: "Tracking",
  APPLIED: "Applied",
  TAKE_HOME_ASSIGNMENT: "Take Home Assignment",
  INTERVIEWING: "Interviewing"
};

const hasContactInfo = listing =>
  !!(listing.contactName || listing.contactEmail || listing.contactPhoneNumber);

export default props => {

  return (
    <Alert>
      <AlertInfo>
        <AlertMetaData>
          <div>
            <JobTitle>{props.alert.title}</JobTitle>
          </div>
        </AlertMetaData>
          <>
            <Divider />
            <AlertDetails>
              <AlertDetail>
                <FaRegAddressBook style={{ marginBottom: "2px" }} />
                {props.alert.sourceObject}
              </AlertDetail>
              <AlertDetail>
                <FaRegEnvelope style={{ marginBottom: "2px" }} />
                {props.alert.type}
              </AlertDetail>
              <AlertDetail>
                <FaPhone style={{ marginBottom: "2px" }} />
                {props.alert.severity}
              </AlertDetail>
            </AlertDetails>
          </>
      </AlertInfo>

    </Alert>
  );
};

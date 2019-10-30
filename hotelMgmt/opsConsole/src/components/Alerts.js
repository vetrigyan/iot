import React, { useState, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import styled from "@emotion/styled";

import Listing from "./Alert";
import { listAlerts } from "../graphql/queries";
import {
  onCreateAlert,
  onUpdateAlert,
  onDeleteAlert
} from "../graphql/subscriptions";

const Container = styled("div")`
  max-width: 800px;
  margin: 16px auto;
`;

const Listings = styled("div")`
  margin-top: 24px;
`;

export default () => {
  const [listings, setListings] = useState([]);
  
  useEffect(() => {
    API.graphql(graphqlOperation(listAlerts))
      .then(result => {
          console.log("Invoked listAlerts callback " + result.data.listAlerts.items[0]);  
        setListings(
          result.data.listAlerts.items.sort((a, b) => {
          console.log("Invoked listAlerts callback a.type=" + a.type + ", b.type=" + b.type);  
            if (a.updatedAt > b.updatedAt) return -1;
            else return 1;
          })
        );
      })
      .catch(error => {
        console.log(error);
      });
  API.graphql(graphqlOperation(onCreateAlert)).subscribe({
      next: (e) => {
          setListings(prevValue => {
          console.log("Invoked onCreateAlert Subcription callback " + e.value.data.onCreateAlert.title);  
          let ids = new Map();
          let updatedListings = prevValue;
          updatedListings.push(e.value.data.onCreateAlert);
                  updatedListings = updatedListings.filter(l => {
                  if (ids.has(l.id)) {
                    console.log("Duplicate listing found, handling it with id= " + l.id + ", title=" + l.title);
                    const dupListing = ids.get(l.id);
                    if (dupListing.updatedAt >= l.updatedAt) {
                      return false;
                    }
                    ids.delete(l.id);
                    ids.set(l.id, l);
                    return true;
                  } else {
                    ids.set(l.id, l);
                    return true;
                  }
                });
          updatedListings.sort((a, b) => {
            if (a.updatedAt > b.updatedAt) return -1;
            else return 1;
          })
            return updatedListings;
          });
      }
    });
  API.graphql(graphqlOperation(onUpdateAlert)).subscribe({
      next: (e) => {
          setListings(prevValue => {
          console.log("Invoked onUpdateListing Subscription callback " + e.value.data.onUpdateAlert.title);  
                const updatedListings = prevValue.map(l => {
                  if (l.id === e.value.data.onUpdateAlert.id) {
                    return e.value.data.onUpdateAlert;
                  }

                  return l;
                });
                return updatedListings;
          });
      }
    });
  API.graphql(graphqlOperation(onDeleteAlert)).subscribe({
      next: (e) => {
          setListings(prevValue => {
          console.log("Invoked onDeleteListing Subscription callback " + e.value.data.onDeleteAlert.title);  
                const updatedListings = prevValue.filter(l => {
                  return l.id !== e.value.data.onDeleteAlert.id;
                });
                return updatedListings;
          });
      }
    });
  }, []);

  return (
    <Container>
      <Listings>
        {listings.map(listing => (
          <Listing
            key={listing.id}
            alert={listing}
          />
        ))}
      </Listings>
    </Container>
  );
};

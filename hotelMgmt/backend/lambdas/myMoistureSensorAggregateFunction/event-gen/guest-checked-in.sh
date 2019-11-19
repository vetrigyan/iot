#!/bin/bash
aws sqs send-message --queue-url https://sqs.us-east-1.amazonaws.com/206982232731/myHotelFrontDeskEventsQueue --message-body file://occupied-send-body.json --delay-seconds 10 --message-attributes file://send-message.json

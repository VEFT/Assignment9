'use strict';

const kafka = require('kafka-node');
const HighLevelConsumer = kafka.HighLevelConsumer;
const client = new kafka.Client('localhost:2181');
let numberOfRequests = 0;
const consumer = new HighLevelConsumer(client,
    [
        {
            topic: 'requests'
        }
    ],
    {
        // The consumer group that this consumer is part of
        groupId: 'mygroup'
    });

consumer.on('message', (message) => {
    console.log('message', message);
    const value = JSON.parse(message.value);
    numberOfRequests = numberOfRequests + 1;
    console.log('value:', value);
    console.log('numberOfRequests', numberOfRequests);
});

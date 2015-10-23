'use strict';

const kafka = require('kafka-node');
const HighLevelConsumer = kafka.HighLevelConsumer;
const client = new kafka.Client('localhost:2181');
const mongoose = require('mongoose');
const uuid = require('node-uuid');
const models = require('./models');
let numberOfRequests = 0;
const UPDATE_ERROR = 'UpdateError';
const consumer = new HighLevelConsumer(client,
    [
        {
            topic: 'users'
        }
    ],
    {
        groupId: 'mygroup'
    }
);


mongoose.connect('localhost/app');
mongoose.connection.once('open', () => {
    consumer.on('message', (message) => {
        const value = JSON.parse(message.value);
        const token = uuid.v4();
        numberOfRequests = numberOfRequests + 1;

        models.User.update({ _id: value._id }, { token: token }, (err) => {
            if(err) {
                console.log(UPDATE_ERROR);
            }
        });
    });
});


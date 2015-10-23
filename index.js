'use strict';

const express = require('express');
const kafka = require('kafka-node');
const mongoose = require('mongoose');
const app = express();
const port = 4000;
const HighLevelProducer = kafka.HighLevelProducer;
const client = new kafka.Client('localhost:2181');
const producer = new HighLevelProducer(client);
const api = require('./api');

// Direct all request with the prefix 'api' to 'api.js'.
app.use('/api', api);

app.use((req, res, next) => {
    const request_details = {
        'timestamp'  : new Date(),
        'path'       : req.path,
        'headers'    : req.headers,
        'method'     : req.method
    };

    console.log('TEST: ', JSON.stringify(request_details));

    const data = [
        { topic: 'requests', messages: JSON.stringify(request_details) }
    ];

    producer.send(data, (err, data) => {
        if(err) {
            console.log('Error:', err);
            next();
        } else {
            console.log(data);
            next();
        }
    });
});

producer.on('ready', () => {
    console.log('Kafka producer is ready');
    mongoose.connect('localhost/app');
    mongoose.connection.once('open', () => {
        console.log('mongoose is connected');
        app.listen(port, () => {
            console.log('Server is on port:', port);
        });
    });
});

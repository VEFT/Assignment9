'use strict';

const express = require('express');
const kafka = require('kafka-node');
const app = express();
const port = 4000;
const HighLevelProducer = kafka.HighLevelProducer;
const client = new kafka.Client('localhost:2181');
const producer = new HighLevelProducer(client);

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

app.get('/', (req, res) => {
    res.send('Hello world');
});

producer.on('ready', () => {
    console.log('Kafka producer is ready');
    app.listen(port, () => {
        console.log('Server starting on port', port);
    });
});

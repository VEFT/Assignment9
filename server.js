'use strict';

const express = require('express');
const mongoose = require('mongoose');
const kafka = require('kafka-node');
const bodyParser = require('body-parser');
const app = express();
const port = 4000;
const HighLevelProducer = kafka.HighLevelProducer;
const client = new kafka.Client('localhost:2181');
const producer = new HighLevelProducer(client);
const api = require('./api');
const models = require('./models');
const VALIDATION_ERROR_NAME = 'ValidationError';
const NOT_FOUND_ERROR_MESSAGE = 'NotFound';
//const CONFLICT_ERROR_MESSAGE = 'Conflict';

app.use((req, res, next) => {
    const request_details = {
        'timestamp'  : new Date(),
        'path'       : req.path,
        'headers'    : req.headers,
        'method'     : req.method
    };

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

/* Returns a list of all users that are in the MongoDB. This endpoint
 * is not authenticated and the token value within the user document
 * must be removed from the document before it is written to the response.
 */
api.get('/users', (req, res) => {
    models.User.find({}, (err, docs) => {
        if(err) {
            res.status(500).send(err.name);
        } else {
            res.status(200).send(docs.map((val) => { val.token = undefined; return val; }));
        }
    });
});

/* Fetches a given user that has been added to MongoDB by ID.
 * This endpoints return a single JSON document if found.
 * If no user is found by the ID then this endpoint returns response
 * with a status code 404. No authentication is needed for this endpoint.
 */
api.get('/users/:id', (req, res) => {
    const id = req.params.id;
    models.User.findOne({ _id : id }, (err, docs) => {
        if(err) {
            res.status(500).send(err.name);
        } else if(!docs) {
            res.status(404).send(NOT_FOUND_ERROR_MESSAGE);
        } else {
            res.status(200).send(docs.map((val) => { val.token = undefined; return val; }));
        }
    });
});

/* Allows administrators to add new users to MongoDB.
 * The user is posted with a POST method and the data sent as a JSON object
 * within the request body.
 * This endpoint is authenticated usding the ADMIN_TOKEN header.
 */
api.post('/users', bodyParser.json(), (req, res) => {
    const user = req.body;
    const u = new models.User(user);
    u.save(function(err, doc) {
        console.log(doc);
        if (err) {
            if(err.name === VALIDATION_ERROR_NAME) {
                res.status(412).send(err.name);
            } else {
                res.status(500).send(err.name);
            }
        } else {
            const data = [
                { topic: 'users', messages: JSON.stringify(user) }
            ];

            producer.send(data, (err, doc) => {
                if(!err) {
                    res.status(201).send(doc);
                }
            });
        }
    });
});

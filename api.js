'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const models = require('./models');
const kafka = require('kafka-node');
const api = express();
const VALIDATION_ERROR_NAME = 'ValidationError';
const NOT_FOUND_ERROR_MESSAGE = 'NotFound';
const HighLevelProducer = kafka.HighLevelProducer;
const client = new kafka.Client('localhost:2181');
const producer = new HighLevelProducer(client);
//const CONFLICT_ERROR_MESSAGE = 'Conflict';

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
 * wi=th a status code 404. No authentication is needed for this endpoint.
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
api.post('/users=', bodyParser.json(), (req, res) => {
    const user = req.body;
    const u = new models.User(user);
    u.save(function(err, doc) {
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
                if(err) {
                    console.log(err);
                    //res.status(500).send(err.name);
                } else {
                    res.status(201).send(doc);
                }
            });

        }
    });
});

module.exports = api;

'use strict';

const express = require('express');
const mongoose = require('mongoose');
const kafka = require('kafka-node');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
const HighLevelProducer = kafka.HighLevelProducer;
const client = new kafka.Client('localhost:2181');
const producer = new HighLevelProducer(client);
const models = require('./models');
const VALIDATION_ERROR_NAME = 'ValidationError';
const DUPLICATE_ERROR_MESSAGE = 'Username and email already taken';
const INVALID_USERNAME_OR_PASSWORD = 'Invalid username or password';

app.use((req, res, next) => {
    const request_details = {
        'timestamp'  : new Date(),
        'path'       : req.path,
        'headers'    : req.headers,
        'method'     : req.method
    };

    const data = [
        { topic: 'users', messages: JSON.stringify(request_details) }
    ];

    producer.send(data, (err, data) => {
        if(err) {
            next();
        } else {
            console.log(data);
            next();
        }
    });
});

mongoose.connect('localhost/app');
mongoose.connection.once('open', () => {
    console.log('mongoose is connected');
    producer.on('ready', () => {
        console.log('Kafka producer is ready');
        app.listen(port, () => {
            console.log('Server is on port:', port);
        });
    });
});


/* An endpoint where a user can post a JSON payload on the form
 * { 'username': ..., 'password': ... }
 * If the username and password is correct, then the token is sent back in the response.
 * If not, the endpoint returns back status code 401.
 */
app.post('/api/token', (req, res) => {
    const user = req.body;

    models.User.findOne(user, (err, docs) => {
        if(err) {
            res.status(401).send(INVALID_USERNAME_OR_PASSWORD);
        } else {
            res.status(200).send(docs.token);
        }
    });
});

/* An endpoint for creating new users. After the user has been written to MongoDB
 * the posted JSON object is written to a Kafka topic named users.
 * The post payload includes at least the following fields: username, password, email and age.
 * If the username or the email is already taken, the endpoint returns status code 409 with a relevant error message.
 * If the new user is created then the API returns the status code 201.
*/
app.post('/api/users', bodyParser.json(), (req, res) => {
    const user = req.body;
    const u = new models.User(user);

    /* We go through our users to try and see if a user already exists with
     * this username or with this email.*/
    models.User.findOne({ $or:[ { username: u.username }, {email : user.email } ]}, (err, docs) => {
        if(err) {
            res.status(500).send(err.name);
        }
        /* If none existed with this username or email, then we can go ahead and continue */
        else if(!docs) {
            u.save((err, savedoc) => {
                if (err) {
                    if(err.name === VALIDATION_ERROR_NAME) {
                        res.status(412).send(err.name);
                    } else {
                        res.status(500).send(err.name);
                    }
                } else {
                    user._id = savedoc._id;

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
        }
        /* Else we already have a user with this username or email and send
         * a 'duplicate' error and a conflict status code */
        else {
            res.status(409).send(DUPLICATE_ERROR_MESSAGE);
        }
    });
});



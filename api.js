'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const models = require('./models');
const api = express();
const VALIDATION_ERROR_NAME = 'ValidationError';
const NOT_FOUND_ERROR_MESSAGE = 'NotFound';
const CONFLICT_ERROR_MESSAGE = 'Conflict';

/* Fetches a list of companies that have been added to MongoDB.
 * This endpoint uses no authentication.
 * If no company has been added this endpoint returns an empty list.
 */
/*
api.get('/companies', (req, res) => {
    models.Company.find({}, (err, docs) => {
        if(err) {
            res.status(500).send(err.name);
        } else {
            res.status(200).send(docs);
        }
    });
});
*/

/* Fetches a given company that has been added to MongoDB by ID.
 * This endpoints returns a single JSON document if found.
 * If no company is found by the ID then this endpoint returns response
 * with status code 404. No authentication is needed for this endpoint.
 */
/*
api.get('/companies/:id', (req, res) => {
    const id = req.params.id;
    models.Company.findOne({ _id : id }, (err, docs) => {
        if(err) {
            res.status(500).send(err.name);
        } else if(!docs) {
            res.status(404).send(NOT_FOUND_ERROR_MESSAGE);
        } else {
            console.log(docs);
            res.status(200).send(docs);
        }
    });
});
*/

/* Allows administrators to add new companies to MongoDB.
 * The company is posted with a POST method and the data sent as a JSON object
 * within the request body.
 * This endpoint is authenticated using the ADMIN_TOKEN header.
 */
/*
api.post('/companies', bodyParser.json(), (req, res) => {
    const token = req.header("ADMIN_TOKEN");
    if(!token || token !== ADMIN_TOKEN) {
        res.status(401).send(UNAUTHORIZED_ERROR_MESSAGE);
    } else {
        const c = new models.Company(req.body);
        c.save(function(err, doc) {
            if (err) {
                if(err.name === VALIDATION_ERROR_NAME) {
                    res.status(412).send(err.name);
                } else {
                    res.status(500).send(err.name);
                }
            } else {
                res.status(201).send({ company_id: c._id});
            }
        })
    }
});
*/

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
 *
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
    const u = new models.User(req.body);
    u.save(function(err, doc) {
        if (err) {
            if(err.name === VALIDATION_ERROR_NAME) {
                res.status(412).send(err.name);
            } else {
                res.status(500).send(err.name);
            }
        } else {
            res.status(201).send(doc);
        }
    });
});

/* Creates a new punch card for company :company_id.
 * This endpoint is authenticated using the user token.
 * Clients sends a request with TOKEN value in the header.
 * That value is used to authenticate the user. A new document is created in the
 * app.punchcards collections with the user_id which owns the TOKEN value found in the header.
 */
/*
api.post('/punchcards/:company_id', (req, res) => {
    const token = req.header("TOKEN");
    const company_id = req.params.company_id;
    if(!token) {
        res.status(401).send();
    } else {
        models.User.findOne({ token : token }, (user_err, user_docs) => {
            if(user_err) {
                res.status(500).send(user_err.name);
            } else if(!user_docs) {
                res.status(401).send(UNAUTHORIZED_ERROR_MESSAGE);
            } else {
                models.Company.findOne({ _id : company_id }, (company_err, company_docs) => {
                    if(company_err) {
                        res.status(500).send(company_err.name);
                    } else if(!company_docs) {
                        res.status(404).send(NOT_FOUND_ERROR_MESSAGE);
                    } else {
                        models.Punchcard.find({ company_id: company_id, user_id: user_docs._id }, (punch_err, punch_docs) => {
                            var is_active = false;
                            if(punch_err) {
                                res.status(500).send(punch_err.name);
                            } else if(punch_docs) {
                                for(var i = 0; i < punch_docs.length; i++) {
                                    console.log(punch_docs[i]);
                                    var punchcard_exp_date = punch_docs[i].created;
                                    punchcard_exp_date.setDate(punchcard_exp_date.getDate() + company_docs.punchcard_lifetime);

                                    if(punchcard_exp_date >= new Date()) {
                                        is_active = true;
                                        break;
                                    }
                                }
                            }

                            if(is_active) {
                                res.status(409).send(CONFLICT_ERROR_MESSAGE);
                            } else {
                                const body = {};
                                body.user_id = user_docs._id;
                                body.company_id = company_id;
                                const p = new models.Punchcard(body);

                                p.save(function(punch_save_err, punch_save_docs) {
                                    if (punch_save_err) {
                                        if(punch_save_err.name === VALIDATION_ERROR_NAME) {
                                            res.status(412).send(punch_save_err.name);
                                        } else {
                                            res.status(500).send(punch_save_err.name);
                                        }
                                    } else {
                                        res.status(201).send(punch_save_docs);
                                    }
                                })
                            }
                        });
                    }
                });
            }
        });
    }
});
*/

module.exports = api;

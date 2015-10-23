'use strict';

const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1
    },
    token: {
        type: String,
        required: true,
        minlength: 1
    },
    age: {
        type: Number,
        required: true,
        min: 0
    },
    gender: {
        type: String,
        required: true,
        maxlength: 1,
        minlength: 1
    }
});

/*
const CompanySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1
    },
    description: {
        type: String,
        required: true,
        minlength: 1
    },
    punchcard_lifetime: {
        type: Number,
        required: true
    }
});
*/

/*
const PunchcardSchema = mongoose.Schema({
    company_id: {
        type: String,
        required: true,
        minlength: 1
    },
    user_id: {
        type: String,
        required: true,
        minlength: 1
    },
    created: {
        type: Date,
        default: new Date()
    }
});
*/

module.exports = {
    User: mongoose.model('User', UserSchema)
    //Company: mongoose.model('Company', CompanySchema),
    //Punchcard: mongoose.model('Punchcard', PunchcardSchema)
};


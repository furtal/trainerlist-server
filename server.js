/*jshint node:true*/
'use strict';

var express = require('express'),
    app = express(),
    Model = require('./models/model.js').Model,
    respondJSON = require('./utils.js').respondJson,
    errorHandler = require('./errors.js').errorHandler;

var DEBUG_OOZER = {
        _id: '1D-0F-00Z3R',
        _rev: 'SOME-VERSION',
        isTrainer: true,
        email: 'oozer@email.com',
        username: 'oozer',
        firstName: 'Oozer',
        lastName: 'Silva'
    };

var SOME_EVENTS = [
    {
        _id: '1231-af2af-asda2',
        _rev: 'fas2a-213fa',
        timestamp: 3, // in 3 days
        description: 'some event and tàl',
        owner: '1D-0F-00Z3R'
    }, {
        _id: '123412-1afsada',
        _rev: '123afasd',
        timestamp: 5, // in 5 days
        description: 'Event',
        owner: '1D-0F-00Z3R'
    }, {
        _id: '1231_EVENT',
        _rev: 'VERSION',
        timestamp: 10, // in 10 days
        description: 'EVENT OF DARKNESS',
        owner: '1D-0F-00Z3R'
    }
];

var PAST_EVENTS = [
    {
        _id: 'past-event1123',
        _rev: '12asd',
        timestamp: -2,
        description: 'an event in the past',
        owner: '1D-0F-00Z3R'
    }
];

// Turn timestamps into actual date objects and increment days. For testing and all.
for (var i = 0; i < SOME_EVENTS.length; i += 1) {
    var item = SOME_EVENTS[i],
        date = new Date();
    date.setDate(date.getDate() + item.timestamp);
    item.timestamp = date.toISOString();
}

// Body parser
app.use(express.bodyParser());

//
// URL routes
//

// routes in this file
app.use('/', app.router);

// routes in routes/trainer.js
app.use(require('./routes/trainer.js').middleware);

// URL routes in routes/events.js
app.use(require('./routes/events.js').middleware);

// login a user
app.post('/authentication/login', function (req, res) {
    // TODO validate required params email and password are 'email@email.com' and 'password'
    // which is OOZER's login information.
    respondJSON(res, DEBUG_OOZER);
});

app.use(errorHandler);

function startListening (port, next) {
    app.listen(port, next);
}

// If we are the main module (I.E. being called directly, run the server.)
if (require.main === module) {
    // Configure the database
    Model.configDb(__dirname + '/couchdb-config.json', function () {
        startListening(8080);
    });
}

module.exports.startListening = startListening;

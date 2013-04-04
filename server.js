/*jshint node:true*/
'use strict';

var express = require('express'),
    app = express();

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
    date.setDate(date.getDate + item.timestamp);
    item.timestamp = date;
}

function respondJSON(response, object) {
    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify(object));
    response.end();
}

// create trainer
app.post('/trainer', function (req, res) {
    // TODO validate required stuff when creating user
    // TODO validate rev and id
    var newUser = {};
    respondJSON(res, newUser);
});

// get trainer
app.get('/trainer/:id', function (req, res) {
    // TODO validate ID is id of OOZER
    respondJSON(res, DEBUG_OOZER);
});

// edit
app.post('/trainer/:id', function (req, res) {
    // TODO validate input version and id
    DEBUG_OOZER._rev = '' + (Math.random() * 1000);
    respondJSON(res, DEBUG_OOZER);
});

// delete
app.post('/trainer/:id/delete', function (req, res) {
    // TODO validate version and id
    respondJSON(res, {});
});

// login a user
app.post('/authentication/login', function (req, res) {
    // TODO validate required params email and password are 'email@email.com' and 'password'
    // which is OOZER's login information.
    respondJSON(res, DEBUG_OOZER);
});

// upcoming events
app.get('/events/upcoming/:user_id', function (req, res) {
    respondJSON(res, SOME_EVENTS);
});

// past events
app.get('/events/past/:user_id', function (req, res) {
    respondJSON(res, PAST_EVENTS);
});

// create event
app.post('/events/:user_id/create', function (req, res) {
    respondJSON(res, {});
});

// get event
app.get('/events/:event_id', function (req, res) {
    respondJSON(res, {});
});

// edit event
app.post('/events/:event_id/edit', function (req, res) {
    respondJSON(res, {});
});

app.listen(8080);

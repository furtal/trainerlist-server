'use strict';

var express = require('express'),
    router = new express.Router(),
    Event = require('../models/event.js').Event;

// upcoming events
router.get('/events/upcoming/:user_id', function (req, res) {
    respondJSON(res, SOME_EVENTS);
});

// past events
router.get('/events/past/:user_id', function (req, res) {
    respondJSON(res, PAST_EVENTS);
});

// create event
router.post('/events/create/:user_id', function (req, res) {
    respondJSON(res, {});
});

// get event
router.get('/events/:event_id', function (req, res) {
    respondJSON(res, {});
});

// edit event
router.post('/events/:event_id/edit', function (req, res) {
    respondJSON(res, {});
});

// delete event
router.post('/events/:event_id/delete', function (req, res) {
    respondJSON(res, {});
});


module.exports = router;


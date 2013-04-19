'use strict';

var express = require('express'),
    router = new express.Router(),
    Event = require('../models/event.js').Event,
    Trainer = require('../models/trainer.js').Trainer;

router.param('user_id', function (req, res, next, userId) {
    req.trainer = new Trainer(userId);
    req.trainer.pLoad()
        .then(function () {
            next();
        })
        .fail(next);
});

router.param('event_id', function (req, res, next, eventId) {
    req.event = new Event(eventId);
    req.event.pLoad()
        .then(function () {
            next();
        })
        .fail(next);
});

// upcoming events for the next 30 days
router.get('/events/upcoming/:user_id', function (req, res, next) {
    var start = new Date(),
        end = new Date(),
        nDays = 30; // TODO this is only a Refault

    start.setHours(start.getHours() - 1);
    end.setDate(end.getDate() + nDays);

    // Gets events between `start` and `end`
    new Event(start, end).pByTimestamp()
        .then(function (events) {
            return res
                .json(events)
                .end();
        })
        .fail(next);
});

// past events
router.get('/events/past/:user_id', function (req, res, next) {
    var start = new Date(),
        end = new Date(),
        nDays = 30; // TODO read above
    
    start.setDate(end.getDate() - nDays);

    new Event(start, end).pByTimestamp()
        .then(function (events) {
            events.reverse();
            return res
                .json(events)
                .end();
        })
        .fail(next);
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


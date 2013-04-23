'use strict';

var express = require('express'),
    router = new express.Router(),
    Event = require('../models/event.js').Event,
    Trainer = require('../models/trainer.js').Trainer,
    xDays = require('../utils.js').relativeTimestamp;

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
    var nDays = 30, // TODO this is only a Refault
        start = new Date(),
        end = xDays(nDays); // n days from now

    start.setHours(start.getHours() - 1);

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
    var nDays = 30, // TODO read above
        start = xDays(-nDays),
        end = new Date();

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
router.post('/events/:user_id/create', function (req, res, next) {
    var evt = new Event(req.body);
    return evt.pSave()
        .then(function () {
            return res
                .json(evt)
                .end();
        })
        .fail(next);
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


'use strict';

var express = require('express'),
    router = new express.Router(),
    model = require('../models/model.js'),
    event = require('../models/event.js'),
    trainer = require('../models/trainer.js'),
    xDays = require('../utils.js').relativeTimestamp;

var noop = function () {};
var trainerOptions = {validator: trainer.validate};
var eventOptions = {validator: event.validate};

router.param('user_id', function (req, res, next, userId) {
    model.pLoad(userId, trainerOptions)
        .then(function (loaded) {
            req.trainer = loaded;
        })
        .nodeify(next);
});

router.param('event_id', function (req, res, next, eventId) {
    model.pLoad(eventId, eventOptions)
        .then(function (loaded) {
            req.event = loaded;
        })
        .nodeify(next);
});

// upcoming events for the next 30 days
router.get('/events/upcoming/:user_id', function (req, res, next) {
    var nDays = 30, // TODO this is only a Refault
        start = new Date(),
        end = xDays(nDays); // n days from now

    start.setHours(start.getHours() - 1);

    // Gets events between `start` and `end`
    event.pByTimestamp(start, end)
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
    
    event.pByTimestamp(start, end)
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
    return model.pSave(req.body)  // TODO pluck correct keys
        .then(function (saved) {
            return res
                .json(saved)
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


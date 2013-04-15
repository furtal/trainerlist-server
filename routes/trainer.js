'use strict';

var express = require('express'),
    router = new express.Router(),
    Trainer = require('../models/trainer.js').Trainer,
    errors = require('../errors.js'),
    respondJSON = require('../utils.js').respondJSON;


// create trainer
router.post('/trainer', function (req, res, next) {
    var trainer = new Trainer({
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    // TODO setPassword

    trainer.pSave()
        .then(function () {
            return res
                .json(trainer)
                .end();
        })
        .fail(next);
});

// set req.trainer to a trainer when there is a :trainerid parameter in the URL.
router.param('trainerid', function (req, res, next, id) {
    var trainer = new Trainer();
    trainer._id = req.params.trainerid;
    trainer.pLoad()
        .then(function () {
            req.trainer = trainer;
            return next();
        })
        .fail(next);
});

// get trainer
router.get('/trainer/:trainerid', function (req, res) {
    return respondJSON(res, req.trainer);
});

// edit
router.post('/trainer/:trainerid', function (req, res, next) {
    var trainer = req.trainer;

    if (trainer._rev !== req.body._rev) {
        return next(errors.outdated());
    }

    trainer.extend({
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    if (req.body.password) {
        // TODO setPassword
    }

    trainer.pSave()
        .then(function () {
            return respondJSON(res, trainer);
        })
        .fail(next);
});

// delete
router.post('/trainer/:trainerid/delete', function (req, res) {
    // TODO validate version and id
    respondJSON(res, {});
});

module.exports = router;


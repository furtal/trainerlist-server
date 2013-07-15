'use strict';

var express = require('express'),
    router = new express.Router(),
    model = require('../models/model.js'),
    trainer = require('../models/trainer.js'),
    errors = require('../errors.js'),
    respondJSON = require('../utils.js').respondJSON;

var trainerOptions = {validator: trainer.validateTrainer};

// create trainer
router.post('/trainer', function (req, res, next) {
    var trainer = {
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    };

    // TODO setPassword

    model.pSave(trainer, trainerOptions)
        .then(function (saved) {
            res.json(saved).end();
        })
        .fail(next);
});

// set req.trainer to a trainer when there is a :trainerid parameter in the URL.
router.param('trainerid', function (req, res, next, id) {
    model.pLoad(req.params.trainerid, trainerOptions)
        .then(function (trainer) {
            req.trainer = trainer;
        })
        .nodeify(next);
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

    model.extend(trainer, {
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    if (req.body.password) {
        // TODO setPassword
    }

    model.pSave(trainer, trainerOptions)
        .then(function () {
            return respondJSON(res, trainer);
        })
        .fail(next);
});

// delete
router.post('/trainer/:trainerid/delete', function (req, res, next) {
    var trainer = req.trainer;
    model.pDel(trainer)
        .then(function () {
            return respondJSON(res, trainer);
        })
        .fail(next);
});

module.exports = router;


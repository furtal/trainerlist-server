'use strict';

var express = require('express'),
    router = new express.Router(),
    Trainer = require('../models/trainer.js').Trainer,
    respondJSON = require('../utils.js').respondJSON;


// create trainer
router.post('/trainer', function (req, res) {
    var trainer = new Trainer({
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    if (!trainer.validate() || !req.body.password) {
        return res
            .status(400) // bad request
            .json({error: 'invalid'});
    }

    // TODO setPassword

    trainer.pSave()
        .then(function () {
            return res
                .json(trainer)
                .end();
        })
        .fail(function () {
            return res
                .status(500)
                .json({error: 'db_error'});
        });
});

// set req.trainer to a trainer when there is a :trainerid parameter in the URL.
router.param('trainerid', function (req, res, next, id) {
    var trainer = new Trainer();
    trainer._id = req.params.trainerid;
    trainer.pLoad()
        .then(function () {
            req.trainer = trainer;
            next();
        })
        .fail(function (err) {
            if (err.error === 'not_found') {
                res.status(404);
            } else {
                res.status(500);
            }
            res.json(err);
        });
});

// get trainer
router.get('/trainer/:trainerid', function (req, res) {
    return respondJSON(res, req.trainer);
});

// edit
router.post('/trainer/:trainerid', function (req, res) {
    var trainer = req.trainer;

    if (trainer._rev !== req.body._rev) {
        var errMsg = 'you provided _rev ' + req.body._rev +
                ' but the most recent version is ' + trainer._rev;
        
        return res
            .status(409)
            .json({error: 'outdated', reason: errMsg});
    }

    trainer.extend({
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    if (!trainer.validate()) {
        return res
            .status(400) // bad request
            .json({error: 'invalid'});
    }

    if (req.body.password) {
        // TODO setPassword
    }

    trainer.pSave()
        .then(function () {
            return respondJSON(res, trainer);
        })
        .fail(function (err) {
            res.status(500);
            return respondJSON(res, {error: 'db_error'});
        });
});

// delete
router.post('/trainer/:trainerid/delete', function (req, res) {
    // TODO validate version and id
    respondJSON(res, {});
});

module.exports = router;


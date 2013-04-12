'use strict';

var express = require('express'),
    router = new express.Router(),
    Trainer = require('../models/trainer.js').Trainer,
    respondJSON = require('../utils.js').respondJSON;


// create trainer
router.post('/trainer', function (req, res) {
    var trainer = new Trainer();

    trainer.extend({
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    if (!trainer.validate() || !req.body.password) {
        res.status(400); // Bad request
        respondJSON(res, {error: 'not_valid'});
        return;
    }

    // TODO setPassword

    trainer.save(function (err, data) {
        if (err) {
            res.status(500);
            respondJSON(res, {error: 'db_error'});
            return;
        }
        respondJSON(res, trainer);
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
            respondJSON(res, err);
        });
});

// get trainer
router.get('/trainer/:trainerid', function (req, res) {
    return respondJSON(res, req.trainer);
});

// edit
router.post('/trainer/:trainerid', function (req, res) {
    // TODO validate input version and id

    req.trainer.extend({
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    if (!req.trainer.validate()) {
        res.status(400); // bad request
        return respondJSON(res, {error: 'invalid'});
    }

    if (req.body.password) {
        // TODO setPassword
    }

    req.trainer.pSave()
        .then(function () {
            return respondJSON(res, req.trainer);
        })
        .fail(function (err) {
            throw err;
        });
});

// delete
router.post('/trainer/:trainerid/delete', function (req, res) {
    // TODO validate version and id
    respondJSON(res, {});
});

module.exports = router;


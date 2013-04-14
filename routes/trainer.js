'use strict';

var express = require('express'),
    router = new express.Router(),
    Trainer = require('../models/trainer.js').Trainer,
    dbError = require('../models/model.js').dbError,
    respondJSON = require('../utils.js').respondJSON;


// create trainer
router.post('/trainer', function (req, res, next) {
    var trainer = new Trainer({
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    if (!trainer.validate() || !req.body.password) {
        return next(dbError({error: 'invalid'}, 400));
    }

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
        .fail(function (err) {
            if (err.error === 'not_found') {
                return next(dbError(err, 404));
            } else {
                return next(err)
            }
        });
});

// get trainer
router.get('/trainer/:trainerid', function (req, res) {
    return respondJSON(res, req.trainer);
});

// edit
router.post('/trainer/:trainerid', function (req, res, next) {
    var trainer = req.trainer;

    if (trainer._rev !== req.body._rev) {
        return next(dbError('outdated', 409));
    }

    trainer.extend({
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    if (!trainer.validate()) {
        return next(dbError({error: 'invalid'}, 400));
    }

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


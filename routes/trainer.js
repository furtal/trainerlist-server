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

    // TODO setPassword
    if (!req.body.password) {
        res.status(400);
        respondJSON(res, {error: 'not_valid'});
        return;
    }

    if (!trainer.validate()) {
        res.status(400); // Bad request
        respondJSON(res, {error: 'not_valid'});
        return;
    }

    trainer.save(function (err, data) {
        if (err) {
            res.status(500);
            respondJSON(res, {error: 'db_error'});
            return;
        }
        respondJSON(res, trainer);
    });
});

// get trainer
router.get('/trainer/:id', function (req, res) {
    // TODO validate ID is id of OOZER
    respondJSON(res, DEBUG_OOZER);
});

// edit
router.post('/trainer/:id', function (req, res) {
    // TODO validate input version and id
    DEBUG_OOZER._rev = '' + (Math.random() * 1000);
    respondJSON(res, DEBUG_OOZER);
});

// delete
router.post('/trainer/:id/delete', function (req, res) {
    // TODO validate version and id
    respondJSON(res, {});
});

module.exports = router;

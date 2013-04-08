var express = require('express'),
    router = new express.Router(),
    respondJSON = require('../utils.js').respondJSON;

// create trainer
router.post('/trainer', function (req, res) {
    // TODO validate required stuff when creating user
    // TODO validate rev and id
    var newUser = {};
    respondJSON(res, newUser);
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

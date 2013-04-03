/*jshint node:true*/
'use strict';

var express = require('express'),
    app = express();

var DEBUG_OOZER = {
        _id: '1D-0F-00Z3R',
        _rev: 'SOME-VERSION',
        isTrainer: true,
        email: 'oozer@email.com',
        username: 'oozer',
        firstName: 'Oozer',
        lastName: 'Silva'
    };

function respondJSON(response, object) {
    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify(object));
    response.end();
}

// create trainer
app.post('/trainer', function (req, res) {
    // TODO validate required stuff when creating user
    // TODO validate rev and id
    var newUser = {};
    respondJSON(res, newUser);
});

// get trainer
app.get('/trainer/:id', function (req, res) {
    // TODO validate ID is id of OOZER
    respondJSON(res, DEBUG_OOZER);
});

// edit
app.post('/trainer/:id', function (req, res) {
    // TODO validate input version and id
    DEBUG_OOZER._rev = '' + (Math.random() * 1000);
    respondJSON(res, DEBUG_OOZER);
});

// delete
app.post('/trainer/:id/delete', function (req, res) {
    // TODO validate version and id
    respondJSON(res, {});
});

// login a user
app.post('/user/authenticate', function (req, res) {
    // TODO validate required params email and password are 'email@email.com' and 'password'
    // which is OOZER's login information.
    respondJSON(res, DEBUG_OOZER);
});

app.listen(8080);

// This is a mechanism to sync views to couchdb
// It hashes the view's functions and other possible contents before storing them.
// It uses that hash to check if the view is up to date to the current version of the program, and updates the one on CouchDB otherwise.

var crypto = require('crypto'),
    assert = require('assert'),
    request = require('request'),
    views = require('./views.js').views,
    views,
    getHash,
    stringifyWithFunctionCode,
    JsonClient = require('request-json').JsonClient,
    createDbIfNecessary,
    syncDesignDocuments,
    db = 'http://localhost:5984/trainerlist'; // TODO this should be set in some config.

JsonClient.prototype.putPure = function (path, text, callback) {
    return request({
        method: 'PUT',
        uri: this.host + path,
        body: text,
        headers: {
            'Authorization': this.auth,
            'Content-Type': 'application/json'
        }},
        function (error, response, body) {
            try {
                var bdy = typeof body === 'string'
                    ? JSON.parse(body)
                    : body;
                callback(error, response, bdy);
            } catch (err) {
                callback(err, response, body);
            }
        });
};


// Serialize JSON objects with functions as strings of their source code
stringifyWithFunctionCode = function (obj) {
    return JSON.stringify(obj, function (key, val) {
        if (typeof val === 'function') {
            return val.toString();
        }
        return val;
    });
};


// Hash these design documents' keys incl. functions
getHash = function (obj) {
    var hash = crypto.createHash('md5');
    hash.update(stringifyWithFunctionCode(obj));
    return hash.digest('hex');
};


// Sync design documents
syncDesignDocuments = module.exports.syncDesignDocuments = function (db, done) {
    var client = new JsonClient(db),
        checkedViews = [],
        nextView,
        checkOne,
        iteration;
    checkOne = function (name, done) {
        var localView = views[name],
            localHash = getHash(localView),
            viewJson,
            viewUrl = '/_design/' + name;
        console.log('View: ' + name);

        client.get(viewUrl, function (err, res, doc) {
            if (err || (doc.error && doc.error !== 'not_found')) {
                throw err || res.body;
            }

            if (doc.hash !== localHash) {
                console.log('updating ' + name);
                localView._rev = doc._rev;
                localView.hash = localHash;
                viewJson = stringifyWithFunctionCode(localView);
                client.putPure(viewUrl, viewJson, function (err, res, doc) {
                    if (err || doc.error) {
                        throw err || res.body;
                    }
                    done(); // Design doc updated
                });
            } else {
                done(); // Hashes match
            }
        });
    };

    nextView = function () {
        var viewname;
        for (viewname in views) {
            if (views.hasOwnProperty(viewname)) {
                if (checkedViews.indexOf(viewname) === -1) {
                    checkedViews.push(viewname);
                    return viewname;
                }
            }
        }
    };

    iteration = function () {
        var nextName = nextView();
        if (nextName) {
            checkOne(nextName, iteration);
        } else { // nextView() returns undefined when we're done
            done();
        }
    };

    iteration();
};


createDbIfNecessary = module.exports.createDbIfNecessary = function (db, done) {
    var client = new JsonClient(db);
    client.get('/', function (err, res, doc) {
        if (err) {
            throw err;
        }
        if (doc.error === undefined) {
            console.log('db already existed');
            done();
        }
        if (doc.error === 'not_found' && doc.reason === 'no_db_file') {
            client.put('/', {}, function (err, res, doc) {
                if (err || doc.error) {
                    throw err || res.body;
                }
                console.log('db created: ' + db);
                done();
            });
        }
        if (doc.error) {
            throw res;
        }
    });
};


createDbIfNecessary(db, function (err) {
    if (err) {
        throw err;
    }
    syncDesignDocuments(db, function (err) {
        if (err) {
            throw err;
        }
    });
});


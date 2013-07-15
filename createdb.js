var model = require('./models/model.js'),
    JsonClient = require('request-json').JsonClient

model.configDb(__dirname + '/couchdb-config.json', function () {
    var client = new JsonClient(model.couchDbAddress);
    client.put('', {}, function (err, res, body) {
        if (err) throw err;
        if (body.error) return console.log('Error (' + body.error + '): ' + body.reason);
        console.log('DB created');
    });
});


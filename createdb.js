var Model = require('./models/model.js').Model,
    JsonClient = require('request-json').JsonClient

Model.configDb(__dirname + '/couchdb-config.json', function () {
    var client = new JsonClient(Model.prototype.database);
    client.put('', {}, function (err, res, body) {
        if (err) throw err;
        if (body.error) return console.log('Error (' + body.error + '): ' + body.reason);
        console.log('DB created');
    });
});


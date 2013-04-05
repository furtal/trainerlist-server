// Views module.
// Create views here.
// Sync them up with couchDB by running syncdb.js with node

module.exports.views = {
    "by-timestamp": {
        map: function (doc) {
            if (doc.timestamp) {
                emit(doc.timestamp, doc);
            }
        }
    },
};



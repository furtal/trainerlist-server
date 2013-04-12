/*jshint node: true, couch: true*/
'use strict';

module.exports.views = {
    "by-timestamp": {
        map: function (doc) {
            if (doc.timestamp) {
                emit(doc.timestamp, doc);
            }
        }
    },
};



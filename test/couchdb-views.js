'use strict';

var assert = require('assert'),
    designDoc = require('../design-documents/events.js');

function mockCouchDb(target) {
    /*jshint evil: true*/
    // Inject an arbitrary "emit" function into the function's closure 
    return new Function('emit, args',
        '(' + target + ').apply({}, args);');
}

describe('by-timestamp view', function () {
    var viewFunc = designDoc.views['by-timestamp'];

    it("Should emit timestamps as keys", function (done) {
        var doc = {timestamp: '1234', rest: 'of stuff'},
            emitReplacement = function (key, val) {
                assert.equal(key, '1234');
                assert.equal(val, doc);
                done();
            },
            mockedView = mockCouchDb(viewFunc.map);
        mockedView(emitReplacement, [doc]);
    });

    it("Should emit nothing on other documents", function (done) {
        var doc = {nothing: 'here'},
            emitReplacement = function () {
                done('error: emit shouldn\'t be called');
            },
            mockedView = mockCouchDb(viewFunc.map);
        mockedView(emitReplacement, [doc]);
        done();
    });
});

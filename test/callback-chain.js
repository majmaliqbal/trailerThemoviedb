/*global describe,it,beforeEach,setTimeout*/
'use strict';

var assert = require('assert'),
    Promise = require('bluebird'),
    CallbackChain = require('../inc/callback-chain');

describe('CallbackChain', function () {
    var callbackChain;

    beforeEach(function () {
        callbackChain = new CallbackChain();
    });

    describe('#add', function () {
        it('throw error when callback is not a function', function () {
            assert.throws(function () {
                callbackChain.add();
            }, Error);
        });

        it('add an item in queue cain', function () {
            callbackChain.add(function () {});
            assert.equal(1, callbackChain.queue.size());
        });
    });

    describe('#run', function () {
        it('test if it return Bluebird Promise when empty chain', function () {
            assert.ok(callbackChain.run() instanceof Promise);
        });

        it('test if it return Bluebird Promise when non-empty chain', function () {
            callbackChain.add(function () {});
            assert.ok(callbackChain.run() instanceof Promise);
        });

        it('resolves to self', function () {
            return callbackChain.run().then(function (actual) {
                assert(actual, callbackChain);
            });
        });

        it('test if it clean the internal priority queue', function () {
            callbackChain.add(function () {});
            return callbackChain.run().then(function () {
                assert.ok(callbackChain.queue.isEmpty());
            });
        });

        it('loop from high to low priority items and run them', function () {
            var trace = [];
            callbackChain.add(function () {
                return 0;
            }, -1);

            callbackChain.add(function () {
                return 0;
            }, 1);

            callbackChain.add(function () {
                return 500;
            }, 0);

            return callbackChain.run(function (callback, priority) {
                return new Promise(function (resolve) {
                    setTimeout(function () {
                        trace.push(priority);
                        resolve();
                    }, callback());
                });
            }).then(function () {
                assert.deepEqual(trace, [1, 0, -1]);
            });
        });
    });
});

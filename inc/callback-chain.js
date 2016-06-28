'use strict';

var _ = require('lodash'),
    Promise = require('bluebird'),
    PriorityQueue = require('priorityqueuejs');

function CallBackChain() {
    this.queue = new PriorityQueue(function (a, b) {
        if (a.priority > b.priority) {
            return 1;
        }
        if (a.priority < b.priority) {
            return -1;
        }
        return 0;
    });
}

CallBackChain.defaultPriority = 1;

CallBackChain.defaultIterator = function (callback) {
    return callback();
};

CallBackChain.prototype.add = function (callback, priority) {
    if (!_.isFunction(callback)) {
        throw new Error('Invalid argument: callback must be a function');
    }
    if (priority === undefined) {
        priority = CallBackChain.defaultPriority;
    }
    this.queue.enq({
        callback: callback,
        priority: priority
    });
    return this;
};

CallBackChain.prototype.run = function (iterator) {
    /**
     * As PrirityQueue not support array interface so to add Promise.each iterator
     * @type Array
     */
    var items = [];
    iterator = Promise.method(iterator || CallBackChain.defaultIterator);
    while (!this.queue.isEmpty()) {
        items.push(this.queue.deq());
    }
    return Promise.each(items, function (item) {
        return iterator(item.callback, item.priority);
    }).return(this);
};

module.exports = CallBackChain;

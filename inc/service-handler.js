'use strict';

var _ = require('lodash'),
    util = require('util');

function ServiceHandler() {
    this.colons = {};
    this.instances = {};
    this.factories =  {};
    this.pendingFactories = {};
    this.alwaysCreate = false;
}

ServiceHandler.prototype.colon = function (colon, name) {
    this.colons[colon] = name;
    return this;
};

ServiceHandler.prototype.setClone = function (colon) {
    var stack = [];
    while (this.colons[colon]) {
        if (stack.indexOf(colon) !== -1) {
            throw new Error(util.format(
                'Circular reference: %s -> %s.',
                stack.join(' -> '),
                colon
            ));
        }
        stack.push(colon);
        colon = this.colons[colon];
    }
    return colon;
};

ServiceHandler.prototype.create = function (name, options) {
    var instance, error;
    name = this.setClone(name);
    if (!this.factories[name]) {
        throw new Error(util.format(
            'Unable to find Service: %s.',
            name
        ));
    }
    if (this.pendingFactories[name]) {
        throw new Error(util.format(
            'Dependency issue: %s.',
            name
        ));
    }
    try {
        this.pendingFactories[name] = true;
        instance = this.factories[name](this, options, name);
        delete this.pendingFactories[name];
    } catch (factoryError) {
        error = new Error(util.format(
            'Unable to create the Service: %s. Previous error: %s',
            name,
            factoryError.message
        ));
        error.previous = factoryError;
        throw error;
    }
    if (!instance) {
        throw new Error(util.format(
            'Unable to create service: %s. Request sent to factory but unable to recieve instance.',
            name
        ));
    }
    if (this.validateService) {
        try {
            this.validateService(instance);
        } catch (error) {
            throw new Error(util.format(
                'Invalid service: %s. Previous error: %s',
                name,
                error
            ));
        }
    }
    return instance;
};

ServiceHandler.prototype.register = function (name, factory) {
    if (!_.isFunction(factory)) {
        throw new Error('Factory type error: must need to be a function.');
    }
    name = this.setClone(name);
    this.factories[name] = factory;
    return this;
};

ServiceHandler.prototype.get = function (name) {
    if (this.alwaysCreate) {
        return this.create(name);
    }
    name = this.setClone(name);
    if (!this.instances[name]) {
        this.inject(name, this.create(name));
    }
    return this.instances[name];
};

ServiceHandler.prototype.inject = function (name, instance) {
    if (this.validateService) {
        try {
            this.validateService(instance);
        } catch (error) {
            throw new Error(util.format(
                'Invalid service: %s. Previous error: %s',
                name,
                error
            ));
        }
    }
    name = this.setClone(name);
    this.instances[name] = instance;
    return this;
};

module.exports = ServiceHandler;

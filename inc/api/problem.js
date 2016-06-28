'use strict';

var _ = require('lodash'),
    util = require('util'),
    http = require('http');

/**
 * @see https://tools.ietf.org/html/draft-nottingham-http-problem-06
 */
function ApiProblem(status, detail, type, title, additionalData) {
    this.detail = detail || 'An error occured';
    this.type = type || ApiProblem.types.httpStatusCode;
    this.status = status || 500;
    this.additionalData = additionalData || {};

    if (title) {
        this.title = title;
    } else if ((this.type === ApiProblem.types.httpStatusCode) && http.STATUS_CODES[this.status]) {
        this.title = http.STATUS_CODES[this.status];
    } else {
        this.title = 'Unknown';
    }
}

ApiProblem.types = {
    httpStatusCode: 'http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html'
};

ApiProblem.reservedProperties = [
    'type',
    'title',
    'status',
    'detail'
];

ApiProblem.createFromError = function (error, includeStackTrace) {
    var additionalData = {
        name: error.name
    };
    if (includeStackTrace) {
        additionalData.trace = error.stack;
    }
    return new ApiProblem(
        error.status,
        error.message,
        null,
        null,
        additionalData
    );
};

ApiProblem.prototype.toString = function () {
    return util.format(
        'ApiProblem [%s] %s: %s',
        this.status,
        this.title,
        this.detail
    );
};

ApiProblem.prototype.toJSON = function () {
    return _.assign(
        _.pick(this, ApiProblem.reservedProperties),
        _.omit(this.additionalData, ApiProblem.reservedProperties)
    );
};

module.exports = ApiProblem;

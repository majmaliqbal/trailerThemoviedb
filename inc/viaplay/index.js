'use strict';

var Api = require('./api');

module.exports = {
    Api: Api,

    init: function (services) {
        services.register('ViaplayApi', Api.factory);
    }
};

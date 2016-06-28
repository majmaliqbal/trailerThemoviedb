'use strict';

var express = require('express'),
    service = require('./service');

module.exports = {
    service: service,
    Problem: require('./problem'),

    init: function (services) {
        var app = services.get('Express'),
            router = express.Router();
        services.register('TrailerApiService', service.Trailer.factory);
        router.use('/trailer', services.get('TrailerApiService').router);
        app.use('/api', router);
    }
};

'use strict';

// include external modules
var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    compression = require('compression'),

// include core files    
    Server = require('./inc/server'),
    errorhandler = require('./inc/errorhandler'),
    api = require('./inc/api'),
    viaplay = require('./inc/viaplay'),
    themoviedb = require('./inc/themoviedb'),
    server = new Server();
server.serviceHandler.register('Express', function () {
    return express();
});
server.serviceHandler.colon('RequestListener', 'Express');

server.callbackChain.add(function (serviceHandler) {
    var app = serviceHandler.get('Express');
    app.use([
        bodyParser.urlencoded({extended: false}),
        bodyParser.json(),
        methodOverride(),
        morgan('dev'),
        compression()
    ]);
}, 100);

server.callbackChain.add(function (serviceHandler) {
    var app = serviceHandler.get('Express');
    app.use(errorhandler());
}, -100);

server.callbackChain.add(api.init, 1)
                   .add(viaplay.init, 2)
                   .add(themoviedb.init, 2);

module.exports = server;
server.start();

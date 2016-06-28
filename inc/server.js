'use strict';

var http = require('http'),
    winston = require('winston'),
    ServiceHandler = require('./service-handler'),
    bluebird = require('bluebird'),
    CallBackChain = require('./callback-chain'),
    appConfig = require('../config.json');

function Server() {
    this.connectionPort = appConfig.ports.server || 3000;
    this.serviceHandler = new ServiceHandler();
    this.callbackChain = new CallBackChain();

    this.serviceHandler.register('HttpServer', function (services) {
        var httpServer = http.createServer(services.get('RequestListener'));
        httpServer.on('error', function (error) {
            winston.error('Server error:', error);
            process.exit(-1);
        });
        httpServer.on('listening', function () {
            var addr = httpServer.address();
            winston.info('Listening at %s:%d.', addr.address, addr.port);
        });
        return httpServer;
    });
}

Server.prototype.start = function () {
    var server = this;
    return this.callbackChain.run(function (callback) {
        return callback(server.serviceHandler);
    }).then(function () {
        var httpServer = server.serviceHandler.get('HttpServer');
        return new bluebird(function (resolve) {
            httpServer.on('listening', function () {
                resolve(server);
            });
            
            httpServer.listen(server.connectionPort);
        });
    });
};

module.exports = Server;

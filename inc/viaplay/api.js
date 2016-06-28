'use strict';

var request = require('request-promise'),
    appConfig = require('../../config.json');

function ViaplayApi() {
    this.endpoint = appConfig.viaplayContentAPIEndpoint;
}

ViaplayApi.factory = function () {
    return new ViaplayApi();
};

ViaplayApi.prototype.getMovieEntity = function (url) {
    return request({
        method: 'GET',
        uri: url,
        headers: {
            accept: 'application/json'
        }
    }).then(function (result) {
        return JSON.parse(result);
    });
};

module.exports = ViaplayApi;

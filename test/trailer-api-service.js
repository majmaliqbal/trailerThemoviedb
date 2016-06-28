/*global describe,it*/
'use strict';

var assert = require('assert'),
    Promise = require('bluebird'),
    TrailerApiService = require('../inc/api').service.Trailer,
    ViaplayApi = require('../inc/viaplay').Api,
    TheMovieDBApi = require('../inc/themoviedb').Api;

describe('TrailerApiService', function () {
    var api = new TrailerApiService(
        new ViaplayApi(),
        new TheMovieDBApi()
    );

    describe('#getTrailerUrl', function () {
        var getTrailerUrl = function (req) {
            return new Promise(function (resolve, reject) {
                api.getTrailerUrl(req, {
                    json: resolve
                }, reject);
            });
        };

        this.timeout(25000);

        it('should return a 422 error if movieUrl is omitted', function () {
            return getTrailerUrl({
                query: {}
            }).then(
                function () {
                    return Promise.reject(new Error('Expected an error'));
                },
                function (error) {
                    assert.equal(error.status, 422);
                }
            );
        });

        it('should return the expected trailer url', function () {
            var inputUrl = 'http://content.viaplay.se/pc-se/film/fight-club-1999',
                outputUrl = 'https://www.youtube.com/watch?v=SUXWAEX2jlg';
            return getTrailerUrl({
                query: {
                    movieUrl: inputUrl
                }
            }).then(function (result) {
                assert.equal(result.trailerUrl, outputUrl);
            });
        });        
    });
});

'use strict';

var appConfig = require('../../config.json'),
    request = require('request-promise'),
    apiKey = appConfig.themoviedb.apikey;

/**
 * @see https://www.themoviedb.org/documentation/api
 */
function ThemeMovieDBApi() {
    this.endpoint = appConfig.themovieDBApiEndpoint;
}

ThemeMovieDBApi.factory = function () {
    return new ThemeMovieDBApi();
};

ThemeMovieDBApi.prototype.getTrailerCollectionByImdbId = function (imdbId) {
    return request({
        method: 'GET',
        baseUrl: this.endpoint,
        uri: '/movie/' + imdbId + '/trailers',
        qs: {
            external_source: 'imdb_id',
            api_key: apiKey
        },
        headers: {
            accept: 'application/json'
        }
    }).then(function (result) {
        return JSON.parse(result);
    });
};

module.exports = ThemeMovieDBApi;

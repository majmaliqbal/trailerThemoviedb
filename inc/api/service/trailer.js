'use strict';

var appConfig = require('../../../config.json'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    express = require('express'),
    redis = require('redis'),
    ApiProblem = require('../problem'),
    redisClient = redis.createClient(),
    trailers = {};  // cacheed data for the trailer api    
    
function importTrailersFromRadis() {
    redisClient.hgetall('movie_trailer', function (err, res) {
        if (!err && res !== null) {
            Object.keys(res).forEach (function (id) {
                trailers[id] = JSON.parse(res[id]);
            });
        } 
    });
}

function TrailerApiService(viaplayApi, themeMovieDBApi) {
    this.viaplayApi = viaplayApi;
    this.themeMovieDBApi = themeMovieDBApi;
    if(_.isEmpty(trailers)) {
        importTrailersFromRadis();
    }
    this.router = express.Router();
    this.router.get('/', this.getTrailerUrl.bind(this));
}

TrailerApiService.factory = function (services) {
    return new TrailerApiService(
        services.get('ViaplayApi'),
        services.get('ThemeMovieDBApi')
    );
};

TrailerApiService.prototype.getTrailerUrl = function (req, res, next) {
    var movieUrl = req.query.movieUrl, regex, cacheResult, movieName;

    if (!movieUrl) {
        return next(new ApiProblem(422, 'Validation failed', null, null, {
            messages: {
                movieUrl: 'Value is required'
            }
        }));
    }
    
    regex = new RegExp(appConfig.viaplayContentAPIEndpoint, 'g');
    
    if(!movieUrl.match(regex) || (movieUrl.indexOf('http://') < 0 && movieUrl.indexOf('https://') < 0)) {
        return next(new ApiProblem(422, 'Validation failed', null, null, {
            messages: {
                movieUrl: 'Wrong url provided'
            }
        }));
    }
    cacheResult = false;
    movieName = movieUrl.split('/').pop();
    Promise.resolve(movieUrl).bind(this).then(function (inputUrl) {
        cacheResult = false;
        if(trailers.hasOwnProperty(movieName)) {
            cacheResult = trailers[movieName];
        }
        
        if(!cacheResult) {
            return this.viaplayApi.getMovieEntity(inputUrl);
        }
    }).then(function (entity) {
        if(cacheResult) {
            return cacheResult;
        } 
        var imdbId = _.get(entity, appConfig.viaplayImdbPath);

        if (!imdbId) {
            return Promise.reject(new ApiProblem(404, 'Unable to fetch IMDB identifier'));
        }

        return this.themeMovieDBApi.getTrailerCollectionByImdbId(imdbId);
    }).then(function (collection) {
        if(cacheResult) {
            return cacheResult;
        }
        var trailerUrl = '', jsonObjectResult;
        if(collection.youtube.length >= 1) {
            trailerUrl = appConfig.youtubeTrailerLink + collection.youtube[0].source;
        }
        if (!trailerUrl) {
            return Promise.reject(new ApiProblem(404, 'Unable to fetch trailer URL'));
        }
        
        jsonObjectResult = {
            trailerUrl: trailerUrl
        };
        trailers[movieName] = JSON.stringify(jsonObjectResult);
        redisClient.hset('movie_trailer', movieName, JSON.stringify(jsonObjectResult));
        return jsonObjectResult;
    }).then(function (result) {
        res.json(result);
    }).catch(function (error) {
        next(error);
    });
};

module.exports = TrailerApiService;

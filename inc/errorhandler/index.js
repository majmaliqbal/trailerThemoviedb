'use strict';

var ApiProblem = require('../api').Problem;

module.exports = function () {
    return function (error, req, res, nextIgnored) {
        var problem;
        if (error instanceof ApiProblem) {
            problem = error;
        } else {
            problem = ApiProblem.createFromError(error);
        }

        res.status(problem.status);
        // Express don't seem to abstract statusMessage
        res.statusMessage = problem.title;

        if (req.accepts('json')) {
            res.set('Content-Type', 'application/problem+json');
            res.json(problem.toJSON());
        } else {
            res.set('Content-Type', 'text/plain');
            res.send(problem.toString());
        }
    };
};

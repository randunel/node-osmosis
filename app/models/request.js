'use strict';

var textBody = require('body');
var jsonBody = require('body/json');
var formBody = require('body/form');
var anyBody = require('body/any');

module.exports = function(compound, Request) {
    Request.handleRequest = function handleRequest(proxyReq, req) {
        var request;
        var response;
        proxyReq.on('response', function(proxyRes, req, res) {
            if ('undefined' === typeof res) {
                response = true;
                return save();
            }
            anyBody(res, function(err, any) {
                response = {
                    headers: res.headers,
                    any: any
                };
                save();
            });
        });
        anyBody(req, function(err, any) {
            Request.create({
                subdomain: req.headers.host.split('.')[0],
                req: {
                    method: req.method,
                    any: any,
                    headers: req.headers,
                    url: req.url
                }
            }, function(err, r) {
                request = r;
                save();
            });
        });

        function save() {
            if (request && response) {
                request.res = response;
                request.save();
            }
        }
    };
};


'use strict';

module.exports = function(compound) {

    var httpProxy = require('http-proxy')
    .createProxyServer({})
    .on('error', function(err) {
        console.log('proxy error', err);
    })
    .on('proxyReq', compound.models.Request.handleRequest);

    compound.proxy = {
        proxies: {}, list: [], addUser: function addUser(user, cb) {
            compound.proxy.list.push(user.domain);
            compound.proxy.proxies[user.domain] = function(req, res) {
                var target = 'http://127.0.0.1:' + user.port;
                httpProxy.web(req, res, {
                    target: target,
                    rejectUnauthorized: false,
                    strictSSL: false,
                    ws: true
                });
            };
            setImmediate(cb);
        }
    };
    compound.on('ready', function() {
        compound.injectMiddlewareAt(-1, function proxyMiddleware(req, res, next) {
            if (req.headers && compound.proxy.list.indexOf(req.headers.host) > -1) {
                return compound.proxy.proxies[req.headers.host](req, res);
            }
            next();
        });
    });
};


'use strict';

var net = require('net');

module.exports = function(compound, User) {
    User.beforeCreate = function beforeCreate(next, data) {
        data.createdAt = new Date();
        if ('undefined' === typeof data.domain) {
            data.domain = User.generateDomain();
        }
        if ('undefined' === typeof port) {
            User.getFreePort(function(err, port) {
                if (err) {
                    return next(err);
                }
                data.port = port;
                next();
            });
            return;
        }
        next();
    };

    User.afterCreate = function afterCreate(next) {
        compound.sshd.addUser(this, next);
    };

    User.findOrCreateByKey = function findOrCreateByKey(key, cb) {
        User.all({
            where: {
                key: key
            }
        }, function(err, users) {
            if (err) {
                return cb(err);
            }
            if (users.length > 1) {
                return cb(new Error('Multiple users with the same key'));
            }
            if (users.length === 1) {
                return cb(null, users[0]);
            }
            User.create({
                key: key
            }, cb);
        });
    };

    User.generateDomain = function generateDomain() {
        var letters = 'bcdfghjklmnpqrstvwxyz';
        var numLetters = 3;
        var domain = '';
        for (var i = 0; i < numLetters; i += 1) {
            domain += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        domain += User.globalCounter += 1;
        return domain;
    };

    User.globalCounter = 0;
    User.globalPort = 65535;

    User.getFreePort = function getFreePort(cb) {
        var port = User.globalPort;
        User.globalPort -= 1;

        var server = net.createServer();
        server.listen(port, function(err) {
            server.once('close', function() {
                cb(null, port);
            });
            server.close();
        });
        server.on('error', function(err) {
            User.getFreePort(cb);
        });
    };
};


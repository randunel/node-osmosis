'use strict';

var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
var async = require('async');

module.exports = function(compound) {
    compound.on('ready', function() {
        var dir = compound.sshd.dir = path.join(__dirname, '..', 'sshd');
        var config = new compound.Config();
        async.series([function(next) {
            fs.mkdir(dir, function(err) {
                if (err && 'EEXIST' !== err.code) {
                    throw err;
                }
                next();
            });
        }, function(next) {
            async.parallel([function(next) {
                async.each(compound.app.get('sshd_encryptions'), function(encryption, next) {
                    var cert = path.join(dir, 'ssh_host_' + encryption + '_key');
                    fs.unlink(cert, function(err) {
                        exec('ssh-keygen -N "" -t ' + encryption + ' -f ' + cert, function(err, stdout, stderr) {
                            if (err) {
                                throw err;
                            }
                            next();
                        });
                    });
                }, function() {
                    next();
                });
            }, function(next) {
                config.load(path.join(dir, 'sshd_config'), function(err) {
                    if (err) {
                        throw err;
                    }
                    config.set('AcceptEnv', 'no');
                    config.set('AllowAgentForwarding', 'no');
                    config.set('AllowTcpForwarding', 'yes');
                    config.set('AllowUsers', 'osmosis_ssh');
                    config.set('AuthenticationMethods', 'publickey');
                    config.set('AuthorizedKeysFile', path.join(dir, 'authorized_keys'));
                    config.set('UsePAM', 'no');
                    config.set('UseDNS', 'no');
                    config.set('ChallengeResponseAuthentication', 'no');
                    config.set('ClientAliveCountMax', '3');
                    config.set('ClientAliveInterval', '15');
                    config.set('Compression', 'no');
                    config.set('GatewayPorts', 'no');
                    config.set('HostbasedAuthentication', 'no');
                    config.set('HostKey', path.join(dir, 'ssh_host_rsa_key'));
                    config.set('KbdInteractiveAuthentication', 'no');
                    config.set('LoginGraceTime', '5');
                    config.set('MaxAuthTries', '999');
                    config.set('MaxSessions', '1');
                    config.set('PasswordAuthentication', 'no');
                    config.set('PermitRootLogin', 'no');
                    config.set('PermitTTY', 'no');
                    config.set('PidFile', path.join(dir, 'sshd.pid'));
                    config.set('Port', compound.app.get('sshd_port'));
                    config.set('ListenAddress', '0.0.0.0');
                    config.set('PrintLastLog', 'no');
                    config.set('PrintMotd', 'no');
                    config.set('Protocol', '2');
                    config.set('TCPKeepAlive', 'yes');
                    config.set('UsePrivilegeSeparation', 'sandbox');
                    config.set('X11Forwarding', 'no');

                    config.set('StrictModes', 'no');
                    config.save(function(err) {
                        if (err) {
                            throw err;
                        }
                        next();
                    });
                });
            }]/* end async.parallel */, function(err) {
                next();
            });
        }, function(next) {
            var akFile = path.join(dir, 'authorized_keys');
            fs.unlink(akFile, function(err) {
                exec('touch ' + akFile, function(err) {
                    if (err) {
                        throw err;
                    }
                    next();
                });
            });
        }, function(next) {
            exec('which sshd', function(err, stdout) {
                if (err) {
                    throw err;
                }
                exec(stdout.trim() + ' -f ' + path.join(dir, 'sshd_config'), function(err, stdout, stderr) {
                    if (err) {
                        throw err;
                    }
                    next();
                });
            });
        }]/* end async.series */, function(err) {
            console.log('init done');
            compound.sshd.config = config;
        });
    });

    compound.sshd = {
        addUser: function addUser(user, cb) {
            fs.appendFile(
                path.join(compound.sshd.dir, 'authorized_keys'),
                compound.sshd.getAuthorizedKey(user.key, user.port),
                {
                    mode: 384 // 0600
                },
                function(err) {
                    cb(err);
                }
            );
        },
        getAuthorizedKey: function getAuthorizedKey(key, port) {
            return '' +
            'command="echo You may only use this with osmosis",' +
            'no-agent-forwarding,' +
            'no-X11-forwarding,' +
            'permitopen="localhost:' + port + '" ' +
            key;
        }
    };
};


var Application = require('./application');

var UserController = module.exports = function UserController(init) {
    Application.call(this, init);

    init.before(loadUser, {
        only: ['show', 'edit', 'update', 'destroy']
    });
};

require('util').inherits(UserController, Application);

UserController.prototype.create = function create(c) {
    if (!c.body.key) {
        return c.send({
            code: 400,
            error: 'Public key missing'
        });
    }
    c.User.findOrCreateByKey(c.body.key, function(err, user) {
        if (err) {
            return c.send({
                code: 500,
                error: err
            });
        }
        c.send({
            result: 'success',
            url: 'http://' + user.domain + '.osmosis.mene.ro',
            port: user.port
        });
    });
};

UserController.prototype.index = function index(c) {
    this.title = 'User index';
    c.User.all(function (err, users) {
        c.respondTo(function (format) {
            format.json(function () {
                c.send(err ? {
                    code: 500,
                    error: err
                }: {
                    code: 200,
                    data: users
                });
            });
            format.html(function () {
                c.render({
                    users: users
                });
            });
        });
    });
};

UserController.prototype.show = function show(c) {
    this.title = 'User show';
    var user = this.user;
    c.respondTo(function (format) {
        format.json(function () {
            c.send({
                code: 200,
                data: user
            });
        });
        format.html(function () {
            c.render();
        });
    });
};

UserController.prototype.edit = function edit(c) {
    this.title = 'User edit';
    c.render();
};

UserController.prototype.update = function update(c) {
    var user = this.user;
    var self = this;

    this.title = 'User edit';

    user.updateAttributes(c.body.User, function (err) {
        c.respondTo(function (format) {
            format.json(function () {
                if (err) {
                    c.send({
                        code: 500,
                        error: user && user.errors || err
                    });
                } else {
                    c.send({
                        code: 200,
                        data: user.toObject()
                    });
                }
            });
            format.html(function () {
                if (!err) {
                    c.flash('info', 'User updated');
                    c.redirect(c.pathTo.user(user));
                } else {
                    c.flash('error', 'User can not be updated');
                    c.render('edit');
                }
            });
        });
    });

};

UserController.prototype.destroy = function destroy(c) {
    this.user.destroy(function (error) {
        c.respondTo(function (format) {
            format.json(function () {
                if (error) {
                    c.send({
                        code: 500,
                        error: error
                    });
                } else {
                    c.send({code: 200});
                }
            });
            format.html(function () {
                if (error) {
                    c.flash('error', 'Can not destroy user');
                } else {
                    c.flash('info', 'User successfully removed');
                }
                c.send("'" + c.pathTo.users + "'");
            });
        });
    });
};

function loadUser(c) {
    var self = this;
    c.User.find(c.params.id, function (err, user) {
        if (err || !user) {
            if (!err && !user && c.params.format === 'json') {
                return c.send({code: 404, error: 'Not found'});
            }
            c.redirect(c.pathTo.users);
        } else {
            self.user = user;
            c.next();
        }
    });
}

UserController.prototype.ip = function ip(c) {
    c.send(c.req.headers['x-forwarded-for'] || c.req.connection.remoteAddress);
};


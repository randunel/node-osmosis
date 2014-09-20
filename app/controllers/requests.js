var Application = require('./application');

var RequestController = module.exports = function RequestController(init) {
    Application.call(this, init);

    init.before(loadRequest, {
        only: ['show', 'edit', 'update', 'destroy']
    });
};

require('util').inherits(RequestController, Application);

RequestController.prototype['new'] = function (c) {
    this.title = 'New request';
    this.request = new (c.Request);
    c.render();
};

RequestController.prototype.create = function create(c) {
    c.Request.create(c.body.Request, function (err, request) {
        c.respondTo(function (format) {
            format.json(function () {
                if (err) {
                    c.send({code: 500, error: err});
                } else {
                    c.send({code: 200, data: request.toObject()});
                }
            });
            format.html(function () {
                if (err) {
                    c.flash('error', 'Request can not be created');
                    c.render('new', {
                        request: request,
                        title: 'New request'
                    });
                } else {
                    c.flash('info', 'Request created');
                    c.redirect(c.pathTo.requests);
                }
            });
        });
    });
};

RequestController.prototype.index = function index(c) {
    this.title = 'Request index';
    c.Request.all(function (err, requests) {
        c.respondTo(function (format) {
            format.json(function () {
                c.send(err ? {
                    code: 500,
                    error: err
                }: {
                    code: 200,
                    data: requests
                });
            });
            format.html(function () {
                c.render({
                    requests: requests
                });
            });
        });
    });
};

RequestController.prototype.show = function show(c) {
    this.title = 'Request show';
    var request = this.request;
    c.respondTo(function (format) {
        format.json(function () {
            c.send({
                code: 200,
                data: request
            });
        });
        format.html(function () {
            c.render();
        });
    });
};

RequestController.prototype.edit = function edit(c) {
    this.title = 'Request edit';
    c.render();
};

RequestController.prototype.update = function update(c) {
    var request = this.request;
    var self = this;

    this.title = 'Request edit';

    request.updateAttributes(c.body.Request, function (err) {
        c.respondTo(function (format) {
            format.json(function () {
                if (err) {
                    c.send({
                        code: 500,
                        error: request && request.errors || err
                    });
                } else {
                    c.send({
                        code: 200,
                        data: request.toObject()
                    });
                }
            });
            format.html(function () {
                if (!err) {
                    c.flash('info', 'Request updated');
                    c.redirect(c.pathTo.request(request));
                } else {
                    c.flash('error', 'Request can not be updated');
                    c.render('edit');
                }
            });
        });
    });

};

RequestController.prototype.destroy = function destroy(c) {
    this.request.destroy(function (error) {
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
                    c.flash('error', 'Can not destroy request');
                } else {
                    c.flash('info', 'Request successfully removed');
                }
                c.send("'" + c.pathTo.requests + "'");
            });
        });
    });
};

function loadRequest(c) {
    var self = this;
    c.Request.find(c.params.id, function (err, request) {
        if (err || !request) {
            if (!err && !request && c.params.format === 'json') {
                return c.send({code: 404, error: 'Not found'});
            }
            c.redirect(c.pathTo.requests);
        } else {
            self.request = request;
            c.next();
        }
    });
}

var Application = require('./application');

var RequestController = module.exports = function RequestController(init) {
    Application.call(this, init);

    init.before(loadRequest, {
        only: ['show', 'destroy']
    });
};

require('util').inherits(RequestController, Application);

RequestController.prototype.index = function index(c) {
    this.title = 'Request index';
    var url = this.url = c.req.param('url')
    c.Request.all({
        where: {
            subdomain: url
        }
    }, function (err, requests) {
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
    this.url = c.req.param('url')
    var r = this.r;
    this.util = require('util');
    c.respondTo(function (format) {
        format.json(function () {
            c.send({
                code: 200,
                data: r
            });
        });
        format.html(function () {
            c.render();
        });
    });
};

RequestController.prototype.destroy = function destroy(c) {
    this.r.destroy(function (error) {
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
    c.Request.find(c.params.id, function (err, r) {
        console.log('found', r);
        if (err || !r || r.subdomain !== c.req.param('url')) {
            if (!err && !r && c.params.format === 'json') {
                return c.send({code: 404, error: 'Not found'});
            }
            c.redirect(c.pathTo.requests);
        } else {
            self.r = r;
            c.next();
        }
    });
}


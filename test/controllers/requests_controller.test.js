var app, compound
, request = require('supertest')
, sinon   = require('sinon');

function RequestStub () {
    return {
        
    };
}

describe('RequestController', function() {
    beforeEach(function(done) {
        app = getApp();
        compound = app.compound;
        compound.on('ready', function() {
            done();
        });
    });

    /*
     * GET /requests/new
     * Should render requests/new.ejs
     */
    it('should render "new" template on GET /requests/new', function (done) {
        request(app)
        .get('/requests/new')
        .end(function (err, res) {
            res.statusCode.should.equal(200);
            app.didRender(/requests\/new\.ejs$/i).should.be.true;
            done();
        });
    });

    /*
     * GET /requests
     * Should render requests/index.ejs
     */
    it('should render "index" template on GET /requests', function (done) {
        request(app)
        .get('/requests')
        .end(function (err, res) {
            res.statusCode.should.equal(200);
            app.didRender(/requests\/index\.ejs$/i).should.be.true;
            done();
        });
    });

    /*
     * GET /requests/:id/edit
     * Should access Request#find and render requests/edit.ejs
     */
    it('should access Request#find and render "edit" template on GET /requests/:id/edit', function (done) {
        var Request = app.models.Request;

        // Mock Request#find
        Request.find = sinon.spy(function (id, callback) {
            callback(null, new Request);
        });

        request(app)
        .get('/requests/42/edit')
        .end(function (err, res) {
            res.statusCode.should.equal(200);
            Request.find.calledWith('42').should.be.true;
            app.didRender(/requests\/edit\.ejs$/i).should.be.true;

            done();
        });
    });

    /*
     * GET /requests/:id
     * Should render requests/index.ejs
     */
    it('should access Request#find and render "show" template on GET /requests/:id', function (done) {
        var Request = app.models.Request;

        // Mock Request#find
        Request.find = sinon.spy(function (id, callback) {
            callback(null, new Request);
        });

        request(app)
        .get('/requests/42')
        .end(function (err, res) {
            res.statusCode.should.equal(200);
            Request.find.calledWith('42').should.be.true;
            app.didRender(/requests\/show\.ejs$/i).should.be.true;

            done();
        });
    });

    /*
     * POST /requests
     * Should access Request#create when Request is valid
     */
    it('should access Request#create on POST /requests with a valid Request', function (done) {
        var Request = app.models.Request
        , request = new RequestStub;

        // Mock Request#create
        Request.create = sinon.spy(function (data, callback) {
            callback(null, request);
        });

        request(app)
        .post('/requests')
        .send({ "Request": request })
        .end(function (err, res) {
            res.statusCode.should.equal(302);
            Request.create.calledWith(request).should.be.true;

            done();
        });
    });

    /*
     * POST /requests
     * Should fail when Request is invalid
     */
    it('should fail on POST /requests when Request#create returns an error', function (done) {
        var Request = app.models.Request
        , request = new RequestStub;

        // Mock Request#create
        Request.create = sinon.spy(function (data, callback) {
            callback(new Error, request);
        });

        request(app)
        .post('/requests')
        .send({ "Request": request })
        .end(function (err, res) {
            res.statusCode.should.equal(200);
            Request.create.calledWith(request).should.be.true;

            app.didFlash('error').should.be.true;

            done();
        });
    });

    /*
     * PUT /requests/:id
     * Should redirect back to /requests when Request is valid
     */
    it('should redirect on PUT /requests/:id with a valid Request', function (done) {
        var Request = app.models.Request
        , request = new RequestStub;

        Request.find = sinon.spy(function (id, callback) {
            callback(null, {
                id: 1,
                updateAttributes: function (data, cb) { cb(null) }
            });
        });

        request(app)
        .put('/requests/1')
        .send({ "Request": request })
        .end(function (err, res) {
            res.statusCode.should.equal(302);
            res.header['location'].should.include('/requests/1');

            app.didFlash('error').should.be.false;

            done();
        });
    });

    /*
     * PUT /requests/:id
     * Should not redirect when Request is invalid
     */
    it('should fail / not redirect on PUT /requests/:id with an invalid Request', function (done) {
        var Request = app.models.Request
        , request = new RequestStub;

        Request.find = sinon.spy(function (id, callback) {
            callback(null, {
                id: 1,
                updateAttributes: function (data, cb) { cb(new Error) }
            });
        });

        request(app)
        .put('/requests/1')
        .send({ "Request": request })
        .end(function (err, res) {
            res.statusCode.should.equal(200);
            app.didFlash('error').should.be.true;

            done();
        });
    });

    /*
     * DELETE /requests/:id
     * -- TODO: IMPLEMENT --
     */
    it('should delete a Request on DELETE /requests/:id');

    /*
     * DELETE /requests/:id
     * -- TODO: IMPLEMENT FAILURE --
     */
    it('should not delete a Request on DELETE /requests/:id if it fails');
});

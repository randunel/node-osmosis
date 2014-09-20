/*
 db/schema.js contains database schema description for application models
 by default (when using jugglingdb as ORM) this file uses database connection
 described in config/database.json. But it's possible to use another database
 connections and multiple different schemas, docs available at

 http://railwayjs.com/orm.html

 Example of model definition:

 define('User', function () {
     property('email', String, { index: true });
     property('password', String);
     property('activated', Boolean, {default: false});
 });

 Example of schema configured without config/database.json (heroku redistogo addon):
 schema('redis', {url: process.env.REDISTOGO_URL}, function () {
     // model definitions here
 });

*/

var Request = describe('Request', function () {
    property('domain', String, {index: true});
    property('createdAt', Date, {default: function() { return new Date() }});
    set('restPath', pathTo.requests);
});

var User = describe('User', function () {
    property('key', String, {index: true});
    property('domain', String, {index: true});
    property('port', Number, {index: true});
    property('requests', Array, {default: []});
    property('createdAt', Date, {default: function() { return new Date() }});
    set('restPath', pathTo.users);
});


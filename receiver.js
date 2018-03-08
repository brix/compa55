'use strict';

const Router = require('./router');

const Request = require('./receiver/request');
const Response = require('./receiver/response');

module.exports = Router.extend({

    Request: Request,

    Response: Response,

    openRequest: function request(request, callback) {

        request = JSON.parse(request);

        // The response and request object object
        const req = new this.Request(request.method, request.headers, request.url, request.body);
        const res = new this.Response();

        // Circular connection
        req.res = res;
        res.req = req

        res.__end__ = callback;

        this._dispatch(req, res, function next(err, res) {
            throw new Error('Unhandled request.');
        });
    },

    listen: function (client) {
        const openRequestHandle = this.openRequest.bind(this);

        client.connect(openRequestHandle);
    }
});

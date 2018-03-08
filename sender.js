
'use strict';

const Cla55 = require('cla55');

const Request = require('./sender/request');
const Response = require('./sender/response');

module.exports = Cla55.extend({

    Request: Request,
    Response: Response,

    /**
     * Initialize `Client`
     *
     * Options:
     *
     *     - `methods`          array of shortcut methods like 'get', 'post' ...
     *
     * @param   {Object}        options
     * @api     public
     */

    constructor: function constructor(options) {
        options = options || {};

        // Set supported methods by this router
        (options.methods || ['get'])
            .forEach(method => {
                // Save method in list supported methods as upper case
                method = method.toLowerCase();

                // Generate a shortcut for each supported method
                this[method] = function (path) {
                    /*jslint unparam: true*/
                    return this.request.apply(this, [method].concat([].slice.call(arguments)));
                };

                return method;
            });
    },

    request: function (method, url) {
        const req = new this.Request(method, url);

        //
        req.__end__ = (request, callback) => {


            this.__request__(request, (response) => {

                // Parse the response
                try {
                    response = JSON.parse(response);
                } catch (error) {
                    response = {
                        status: 500,
                        headers: {},
                        body: ''
                    };
                }

                const res = new this.Response(response.status, response.headers, response.body);

                if (/^2\d\d$/.test(res.status)) {
                    callback(null, res);
                } else {
                    callback(res, res);
                }
            });
        };

        return req;
    },

    connect: function (openRequest) {
        this.__request__ = openRequest;
    }
});

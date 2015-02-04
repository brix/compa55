/*jscs:disable disallowDanglingUnderscores*/
/*global require, exports, module, define*/
/*global setTimeout*/
(function (root, factory) {

    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD: Register as an anonymous module
        return define(['require', 'exports', 'module', 'cla55', './route', './router', './request', './response'], factory);
    }

    if (typeof exports === 'object') {
        // CommonJS
        return factory(require, exports, module);
    }

}(this, function (require, exports, module) {

    'use strict';

    var Cla55 = require('cla55'),
        Route = require('./route'),
        Router = require('./router'),
        Request = require('./request'),
        Response = require('./response');

    module.exports = Cla55.extend({
        constructor: function constructor(router, Request, Response) {
            // Add provided arguments to instance
            this._Request = Request;
            this._Response = Response;
            this._router = router;

            // Set supported methods by this router
            this._router.methods
                .forEach(function (method) {
                    // Save method in list supported methods as upper case
                    method = method.toLowerCase();

                    // Generate a shortcut for each supported method
                    this[method] = function (path) {
                        /*jslint unparam: true*/
                        return this.request.apply(this, [method].concat([].slice.call(arguments)));
                    };

                    return method;
                }, this);
        },

        request: function request(method, path, data, callback) {
            var that = this,
                callbacks = [],
                req,
                res,
                close;

            // Close the request and execute callbacks
            close = function (err) {
                while (callbacks.length) {
                    callbacks.shift()(err || null, res);
                }
            };

            // The response object
            res = (function createResponse() {
                var responseEndHookedOnce = false,
                    responseEnd,
                    response;

                response = new that._Response();

                responseEnd = response.end;
                response.end = function end(data) {
                    // Call the original response end method
                    var returnValue = responseEnd.apply(this, arguments);

                    // Close the request
                    if (!responseEndHookedOnce) {
                        responseEndHookedOnce = true;

                        close(data);
                    }

                    // Call the original request end method
                    return returnValue;
                };

                return response;
            }());

            // The request object
            req = (function createRequest() {
                var requestEndHookedOnce = false,
                    requestEnd,
                    request;

                request = new that._Request(method, path, {
                    base: that._router.base
                });

                requestEnd = request.end;
                request.end = function end(cb) {
                    // Call the original request end method
                    var returnValue = requestEnd.apply(this, arguments);

                    // Start the middleware services
                    if (!requestEndHookedOnce) {
                        requestEndHookedOnce = true;

                        // Ensure req returns before run async callback chain
                        setTimeout(function () {
                            // Dispatch the request on the router
                            that._router.middleware(req, res, function next(err, res) {
                                close(new Error('Unhandled request.'));
                            });
                        });
                    }

                    // Add callback to the stack
                    callbacks.push(cb);

                    return returnValue;
                };

                return request;
            }());

            // Circular connection of request and response
            req.res = res;
            res.req = req;

            if (typeof data === 'function') {
                callback = data;
                data = null;
            }

            if (data) {
                req.send(data);
            }

            if (typeof callback === 'function') {
                req.end(callback);
            }

            return req;
        }
    }, {
        Route: Route,
        Router: Router,
        Request: Request,
        Response: Response
    });

}));

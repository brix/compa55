/*jslint node: true, plusplus: true, nomen: true*/

module.exports = (function () {

    'use strict';

    var Routify;

    Routify = function Routify() {
        this.constructor.apply(this, arguments);
    };

    Routify.prototype.constructor = function Routify(server, Request, Response) {
        // Add provided arguments to instance
        this._Request = Request;
        this._Response = Response;
        this._server = server;

        // Set supported methods by this server
        this._server.methods
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
    };

    Routify.prototype.request = function request(method, path, data, callback) {
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
                base: that._server.base
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
                        // Dispatch the request on the server
                        that._server.middleware(req, res, function next(err, res) {
                            close(new Error('Unhandled request.'))
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
    };

    return Routify;

}());

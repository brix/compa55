'use strict';

const Router = require('./router');

const Request = require('./Request');
const Response = require('./Response');

module.exports = Router.extend({

    Request: Request,

    Response: Response,

    _open_request: function request(method, path, data, callback) {
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

            response = new that.Response();

            responseEnd = response.end;
            response.end = function end(data) {
                // Call the original response end method
                var returnValue = responseEnd.apply(this, arguments);

                // Close the request
                if (!responseEndHookedOnce) {
                    responseEndHookedOnce = true;

                    close(response);
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

            request = new that.Request(method, path, {
                base: that.base
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
                        that.middleware(req, res, function next(err, res) {
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
    },

    listen: function (client) {
        client.connect(this._open_request.bind(this));
    }
});

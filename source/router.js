/*jslint node: true, plusplus: true*/

module.exports = (function () {

    'use strict';

    var Route = require('./route'),
        Router;

    Router = function Router() {
        return this.constructor.apply(this, arguments);
    };

    Router.prototype.constructor = function Router(options) {
        options = options || {};

        var that = this;

        this.map = {};

        this.base = options.base || '';
        this.caseSensitive = options.caseSensitive;
        this.strict = options.strict;

        // Set supported methods by this router
        this.methods = (options.methods || ['get'])
            .map(function (method) {
                // Save method in list supported methods as upper case
                method = method.toLowerCase();

                // Generate a shortcut for each supported method
                this[method] = function (path, callback) {
                    /*jslint unparam: true*/
                    return this.route.apply(this, [method].concat([].slice.call(arguments)));
                };

                return method;
            }, this);

        // Make it valid middleware
        this.middleware = function router(req, res, next) {
            that._dispatch(req, res, next);
        };
    };

    Router.prototype._dispatch = function (req, res, next) {
        var
            callbacks = [],
            routes = this.map[req.method] || [],
            i = 0,
            j = 0;

        // Callback series per route
        function allCallbacks(req, res, next) {
            function nextCallback() {
                var fn = callbacks[j++];

                // Response is already finished, stop the series
                if (res.finished) {
                    return;
                }

                // Leave the callback series and go for the parent series
                if (!fn) {
                    return next(req, res, next);
                }

                // Execute callback or run the middleware
                if (fn.middleware) {
                    fn.middleware(req, res, nextCallback);
                } else {
                    fn(req, res, nextCallback)
                }
            }

            // Handle next callback in series
            nextCallback();
        }

        // Route series by method
        function allRoutes(req, res, next) {
            function nextRoute() {
                var route = routes[i++];

                // Leave the route series and go for the parent series
                if (!route) {
                    return next(req, res, next);
                }

                // Skip and handle next route in series
                if (!route.match(req.pathname)) {
                    return nextRoute();
                }

                // Reset callback series index
                j = 0;

                // Get callbacks for this route
                callbacks = [].concat(route.callbacks);

                // Provide special data for the request object
                req.params = route.params;
                req.route = route;

                // Run callback series
                allCallbacks(req, res, nextRoute);
            }

            // Start route series
            nextRoute();
        }

        // Run route series
        allRoutes(req, res, next);
    };

    Router.prototype.route = function route(method, path, callbacks) {
        var options = {
                caseSensitive: this.caseSensitive,
                stict: this.strict
            },
            route = new Route(method, this.base + path, callbacks, options);

        // Add route
        /*jslint ass: true*/
        (this.map[method] = this.map[method] || []).push(route);
        /*jslint ass: false*/

        return this;
    };

    Router.prototype.use = function (path, middleware) {
        var that = this,
            args = [].slice.call(arguments);

        // For all paths
        if (typeof path !== 'string') {
            args.unshift('*');
            middleware = path;
        }

        (middleware.methods || this.methods).forEach(function (method) {
            that.route.apply(that, [method].concat(args));
        });

        return this;
    };

    Router.prototype.all = function (path, callback) {
        /*jslint unparam: true*/
        var that = this,
            args = [].slice.call(arguments);

        this.methods.forEach(function (method) {
            that.route.apply(that, [method].concat(args));
        });

        return this;
    };

    return Router;

}());

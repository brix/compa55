'use strict';

const Cla55 = require('cla55');

const Route = require('./route');

module.exports = Cla55.extend({

    Route: Route,

    /**
     * Initialize `Router` with the given HTTP `path`,
     * and an array of `callbacks` and `options`.
     *
     * Options:
     *
     *     - `base`             base path for sub routing as middleware
     *     - `methods`          array of supported methods like 'GET', 'POST' ...
     *     - `caseSensitive`    enable case-sensitive routes
     *     - `strict`           enable strict matching for trailing slashes
     *
     * @param   {Function}      route
     * @param   {Object}        options
     * @api     public
     */

    constructor: function constructor(options) {
        options = options || {};

        this.map = {};

        this.base = options.base || '';
        this.caseSensitive = options.caseSensitive;
        this.strict = options.strict;

        // Set supported methods by this router
        this.methods = (options.methods || ['get'])
            .map(method => {
                // Save method in list supported methods as upper case
                method = method.toLowerCase();

                // Generate a shortcut for each supported method
                this[method] = function (path, callback) {
                    /*jslint unparam: true*/
                    return this.route.apply(this, [method, path].concat([[].slice.call(arguments, 1)]));
                };

                return method;
            });

        // Make it valid middleware
        this.middleware = (req, res, next) => {
            this._dispatch(req, res, next);
        };
    },

    _dispatch: function _dispatch(req, res, next) {
        const routes = this.map[req.method.toLowerCase()] || [];

        let callbacks = [];
        let i = 0;
        let j = 0;

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
                    return next();
                }

                // Add next handler to request object
                req.next = nextCallback;

                // Execute callback or run the middleware
                if (fn.middleware) {
                    req.next = nextCallback;

                    fn.middleware(req, res, nextCallback);
                } else {
                    fn(req, res, nextCallback);
                }
            }

            // Handle next callback in series
            nextCallback();
        }

        // Route series by method
        function allRoutes(req, res, next) {
            function nextRoute() {
                const route = routes[i++];

                // Leave the route series and go for the parent series
                if (!route) {
                    return next();
                }

                // Skip and handle next route in series
                if (!route.match(req._parsedUrl.pathname)) {
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
    },

    route: function route(method, path, callbacks) {
        this.map[method] = this.map[method] || [];

        // Add route
        this.map[method].push(new this.Route(method, this.base + path, callbacks, {
            caseSensitive: this.caseSensitive,
            stict: this.strict
        }));

        return this;
    },

    use: function use(path, middleware) {
        const args = [].slice.call(arguments);

        // For all paths
        if (typeof path !== 'string') {
            args.unshift('*');
            middleware = path;
        }

        (middleware.methods || this.methods).forEach(method => {
            this.route.apply(this, [method].concat(args));
        });

        return this;
    },

    all: function all(path, callback) {
        /*jslint unparam: true*/
        const args = [].slice.call(arguments);

        this.methods.forEach(method => {
            this.route.apply(this, [method].concat(args));
        });

        return this;
    }
});

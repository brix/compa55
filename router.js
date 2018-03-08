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
     *     - `methods`          array of supported methods like 'GET', 'POST' ...
     *     - `sensitive`        enable case-sensitive routes
     *     - `strict`           enable strict matching for trailing slashes
     *     - `end`              match the beginning only
     *
     * @param   {Function}      route
     * @param   {Object}        options
     * @api     public
     */

    constructor: function constructor(options) {
        options = options || {};

        this.map = {};

        this.sensitive = options.sensitive || false;
        this.strict = options.strict || false;

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
        const allCallbacks = (req, res, next) => {
            const nextCallback = () => {
                const callback = callbacks[j++];

                // Response is already finished, stop the series
                if (res.finished) {
                    return;
                }

                // Leave the callback series and go for the parent series
                if (!callback) {
                    return next();
                }

                // Add next handler to request object
                req.next = nextCallback;

                // Execute callback
                callback(req, res, nextCallback);
            }

            // Handle next callback in series
            nextCallback();
        }

        // Route series by method
        const allRoutes = (req, res, next) => {
            const nextRoute = () => {
                const route = routes[i++];

                // Leave the route series and go for the parent series
                if (!route) {
                    return next();
                }

                // Skip and handle next route in series
                if (!route.match(req.url)) {
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
        // Ensure route map by method
        this.map[method] = this.map[method] || [];

        // Create and route
        this.map[method].push(new this.Route(method, path, callbacks, {
            sensitive: this.sensitive,
            strict: this.strict
        }));

        return this;
    },

    use: function use(path, middleware) {
        /*jslint unparam: true*/

        // For all paths
        if (typeof path === 'function' || Object.prototype.toString.call(path) === '[object Object]') {
            middleware = path;
            path = '';
        }

        if (typeof middleware.middleware === 'function') {
            middleware = middleware.middleware;
        }

        (middleware.methods || this.methods).forEach(method => {
            // Ensure route map by method
            this.map[method] = this.map[method] || [];

            // Create handle
            const handle = function (req, res, next) {
                // Preserve the current url to write back after handle middleware
                const preserveUrl = req.url;

                // Remove left middleware path of the url
                req.url = req.url.replace(route.regexp, '');

                // Call the middleware with next hook
                middleware(req, res, () => {
                    // Write back original url
                    req.url = preserveUrl;

                    // Call original next
                    next();
                });
            };

            // Create route
            const route = new this.Route(method, path, [handle], {
                sensitive: this.sensitive,
                strict: false,
                end: false
            });

            // Add route
            this.map[method].push(route);
        });

        return this;
    },

    all: function all(path, callback) {
        /*jslint unparam: true*/
        const callbacks = [].slice.call(arguments, 1);

        this.methods.forEach(method => {
            this.route.call(this, method, path, callbacks);
        });

        return this;
    }
});

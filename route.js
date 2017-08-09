'use strict';

const Cla55 = require('cla55');

const pathToRegexp = require('path-to-regexp');

module.exports = Cla55.extend({

    /**
     * Initialize `Route` with the given HTTP `path`,
     * and an array of `callbacks` and `options`.
     *
     * Options:
     *
     *     - `sensitive`        when true the route will be case sensitive
     *     - `strict`           when false the trailing slash is optional
     *     - `end`              when false the path will match at the beginning
     *
     * @param   {String}        method
     * @param   {String}        path
     * @param   {Array}         callbacks
     * @param   {Object}        options
     * @api     private
     */

    constructor: function constructor(method, path, callbacks, options) {
        options = options || {};
        this.path = path;
        this.method = method;
        this.callbacks = callbacks;
        /*jslint ass: true*/

        this.regexp = pathToRegexp(path, this.keys = [], {
            sensitive: options.sensitive,
            strict: options.strict === false ? false : true,
            end: options.end === false ? false : true
        });
    },

    /**
     * Check if this route matches `path`, if so
     * populate `params`.
     *
     * @param   {String}        path
     * @param   {Array}         params
     * @return  {Boolean}
     * @api     private
     */

    match: function match(path) {
        /*jslint bitwise: true*/
        const keys = this.keys;
        const params = this.params = [];
        const qsIndex = path.indexOf('?');
        const pathname = qsIndex !== -1 ? path.slice(0, qsIndex) : path;
        const m = this.regexp.exec(decodeURIComponent(pathname));

        if (!m) {
            return false;
        }

        for (let i = 1, len = m.length; i < len; ++i) {
            const key = keys[i - 1];
            const val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i];

            if (key) {
                params[key.name] = undefined !== params[key.name] ? params[key.name] : val;
            } else {
                params.push(val);
            }
        }

        return true;
    }
});

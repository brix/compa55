/*global require, exports, module, define*/
(function (root, factory) {

    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD: Register as an anonymous module
        return define(['require', 'exports', 'module', 'cla55'], factory);
    }

    if (typeof exports === 'object') {
        // CommonJS
        return factory(require, exports, module);
    }

}(this, function (require, exports, module) {

    'use strict';

    var Cla55 = require('cla55');

    module.exports = Cla55.extend({

        /**
         * Initialize `Route` with the given HTTP `path`,
         * and an array of `callbacks` and `options`.
         *
         * Options:
         *
         *     - `caseSensitive`    enable case-sensitive routes
         *     - `strict`           enable strict matching for trailing slashes
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
            this.regexp = this.pathtoRegexp(path, this.keys = [], options.caseSensitive, options.strict);
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
            var keys = this.keys,
                params = this.params = [],
                qsIndex = path.indexOf('?'),
                pathname = qsIndex !== -1 ? path.slice(0, qsIndex) : path,
                m = this.regexp.exec(decodeURIComponent(pathname)),
                i,
                len,
                key,
                val;

            if (!m) {
                return false;
            }

            for (i = 1, len = m.length; i < len; ++i) {
                key = keys[i - 1];
                val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i];

                if (key) {
                    params[key.name] = undefined !== params[key.name] ? params[key.name] : val;
                } else {
                    params.push(val);
                }
            }

            return true;
        },

        /**
         * Normalize the given path string,
         * returning a regular expression.
         *
         * An empty array should be passed,
         * which will contain the placeholder
         * key names. For example "/user/:id" will
         * then contain ["id"].
         *
         * @param   {String|RegExp|Array} path
         * @param   {Array}         keys
         * @param   {Boolean}       sensitive
         * @param   {Boolean}       strict
         * @return  {RegExp}
         * @api     private
         */

        pathtoRegexp: function pathtoRegexp(path, keys, sensitive, strict) {
            /*jslint regexp: true, nomen: true, unparam: true*/
            if (path instanceof RegExp) {
                return path;
            }

            if (path instanceof Array) {
                path = '(' + path.join('|') + ')';
            }

            path = path
                .concat(strict ? '' : '/?')
                .replace(/\/\(/g, '(?:/')
                .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function (_, slash, format, key, capture, optional) {
                    keys.push({
                        name: key,
                        optional: optional ? true : false
                    });

                    slash = slash || '';

                    return (
                        (optional ? '' : slash) +
                        '(?:' +
                        (optional ? slash : '') +
                        (format || '') + (capture || ((format && '([^/.]+?)') || '([^/]+?)')) + ')' +
                        (optional || '')
                    );
                })
                .replace(/([\/.])/g, '\\$1')
                .replace(/\*/g, '(.*)');

            return new RegExp('^' + path + '$', sensitive ? '' : 'i');
        }
    });

}));

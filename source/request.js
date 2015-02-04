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

    var Cla55 = require('cla55'),

        parse = function parse(querystring) {
            var query = {};

            querystring
                .replace(/^(\?)/, '')
                .split('&')
                .forEach(function (pair) {
                    pair = pair.split('=');

                    var registers = [],
                        name = decodeURIComponent(pair[0]),
                        value = decodeURIComponent(pair[1] || ''),
                        tmp = query,
                        register,
                        next,
                        j,
                        l;

                    name = name.replace(/\[([^\]]*)\]/g, function (all, $1) {
                        /*jslint unparam: true*/
                        registers.push($1);
                        return '';
                    });

                    registers.unshift(name);

                    for (j = 0, l = registers.length - 1; j < l; j++) {
                        register = registers[j];

                        next = registers[j + 1];

                        if (!tmp[register]) {
                            tmp[register] = next === '' || (/^[0-9]+$/).test(next) ? [] : {};
                        }

                        tmp = tmp[register];
                    }

                    register = registers[l];

                    if (register === '') {
                        tmp.push(value);
                    } else {
                        tmp[register] = value;
                    }
                });

            return query;
        };

    module.exports = Cla55.extend({

        /**
         * Initialize a new "request" `Request`
         * with the given `path` and optional initial `state`.
         *
         * @param {String} path
         * @param {String} base
         * @api public
         */

        constructor: function constructor(method, path, options) {
            options = options || {};

            var base = options.base || '',
                parts,
                i;

            if (path[0] === '/' && path.indexOf(base) !== 0) {
                path = base + path;
            }

            i = path.indexOf('?');

            this.method = method;
            this.path = path.replace(base, '') || '/';
            this.canonicalPath = path;

            //this.title = document.title;
            //this.state = state || {};
            //this.state.path = path;
            this.querystring = i !== -1 ? path.slice(i + 1) : '';
            this.pathname = i !== -1 ? path.slice(0, i) : path;
            this.params = [];

            // fragment
            this.hash = '';
            if (this.path.indexOf('#') !== -1) {
                parts = this.path.split('#');
                this.path = parts[0];
                this.hash = parts[1] || '';
                this.querystring = this.querystring.split('#')[0];
            }
            this.query = parse(this.querystring);
        },

        param: function param(key) {
            return this.params[key];
        },

        end: function end(callback) {
            return this;
        }
    });


}));

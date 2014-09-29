/*jslint node: true, plusplus: true, nomen: true, bitwise: true, regexp: true*/

module.exports = (function () {

    'use strict';

    function parse(querystring) {
        var query = {};

        querystring
            .replace(/^(\?)/, "")
            .split("&")
            .forEach(function (pair) {
                pair = pair.split("=");

                var registers = [],
                    name = decodeURIComponent(pair[0]),
                    value = decodeURIComponent(pair[1] || ""),
                    tmp = query,
                    register,
                    next,
                    j,
                    l;

                name = name.replace(/\[([^\]]*)\]/g, function (all, $1) {
                    /*jslint unparam: true*/
                    registers.push($1);
                    return "";
                });

                registers.unshift(name);

                for (j = 0, l = registers.length - 1; j < l; j++) {
                    register = registers[j];

                    next = registers[j + 1];

                    if (!tmp[register]) {
                        tmp[register] = next === "" || (/^[0-9]+$/).test(next) ? [] : {};
                    }

                    tmp = tmp[register];
                }

                register = registers[l];

                if (register === "") {
                    tmp.push(value);
                } else {
                    tmp[register] = value;
                }
            });

        return query;
    }

    /**
     * Initialize a new "request" `Request`
     * with the given `path` and optional initial `state`.
     *
     * @param {String} path
     * @param {String} base
     * @api public
     */

    function Request() {
        this.constructor.apply(this, arguments);
    }

    Request.prototype.constructor = function Request(method, path, options) {
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
        this.querystring = ~i ? path.slice(i + 1) : '';
        this.pathname = ~i ? path.slice(0, i) : path;
        this.params = [];

        // fragment
        this.hash = '';
        if (~this.path.indexOf('#')) {
            parts = this.path.split('#');
            this.path = parts[0];
            this.hash = parts[1] || '';
            this.querystring = this.querystring.split('#')[0];
        }
        this.query = parse(this.querystring);
    };

    Request.prototype.param = function param(key) {
        return this.params[key];
    };

    Request.prototype.end = function end(callback) {
        return this;
    };

    return Request;

}());

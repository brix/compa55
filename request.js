'use strict';

const Cla55 = require('cla55');

const qs = require('qs');
const url = require('url');

const keys = ['hash', 'host', 'hostname', 'href', 'origin', 'pathname', 'port', 'protocol', 'search'];
const nullToEmptyString = function (obj) {
    keys.forEach(key => {
        if (obj[key] === null) {
            obj[key] = '';
        }
    });

    return obj;
};

module.exports = Cla55.extend({

    /**
     * Initialize a new "request" `Request`
     * with the given `url` and optional initial `state`.
     *
     * @param   {String}        method
     * @param   {String}        path
     * @param   {Object}        options
     * @api public
     */

    constructor: function constructor(method, path, options) {
        options = options || {};

        this.method = method.toUpperCase();

        // Parsed url
        this._parsedUrl = nullToEmptyString(_.pick(url.parse(path), keys));
        this._parsedUrl.query = qs.parse(this._parsedUrl.search);

        // Raw url path
        this.originalUrl = this._parsedUrl.pathname + this._parsedUrl.search + this._parsedUrl.hash;
        this.url = this.originalUrl;

        // Domain
        this.domain = this._parsedUrl.domain;

        // Query
        this.query = this._parsedUrl.query;

        // Params
        this.params = {};

        // Headers
        this.headers = options.headers || {};

        // Body
        this.body = options.body || {};

        // Dummy next handler
        this.next = function () {
            return;
        };
    },

    param: function param(key) {
        return this.params[key];
    },

    end: function end(callback) {
        return this;
    }
});

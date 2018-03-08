'use strict';

const _ = require('lodash');
const qs = require('qs');
const url = require('url');
const Cla55 = require('cla55');

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

    constructor: function constructor(method, headers, path, body) {
        this.method = method.toUpperCase();

        // Parsed url
        this._parsedUrl = nullToEmptyString(_.pick(url.parse(path), keys));
        this._parsedUrl.query = qs.parse(this._parsedUrl.search.replace(/^\?/, ''));

        // Raw url path
        this.originalUrl = this._parsedUrl.pathname + this._parsedUrl.search + this._parsedUrl.hash;
        this.url = this._parsedUrl.pathname;

        // Domain
        this.domain = this._parsedUrl.domain;

        // Query
        this.query = this._parsedUrl.query;

        // Params
        this.params = {};

        // Headers
        this.headers = headers || {};

        // Body
        this.body = body || {};

        // Dummy next handler
        this.next = function () {
            return;
        };
    },

    param: function param(key) {
        return this.params[key];
    },

    header: function (field) {
        return this.headers[field.toLowerCase()];
    }
});

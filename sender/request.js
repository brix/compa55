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

const Request = Cla55.extend({
    /**
     * Initialize a new "request" `Request`
     * with the given `method` and `url`.
     *
     * @param   {String}        method
     * @param   {Object}        req
     * @api public
     */
    constructor: function (method, requestUrl) {
        const parsedUrl = nullToEmptyString(_.pick(url.parse(requestUrl), keys));

        this._url = parsedUrl.pathname;

        this._headers = {};
        this._query = qs.parse(parsedUrl.search);
        this._body = {};

        this.headers = {};

        this.end = this.end.bind(this, method);
    },

    type: function (type) {
        this.set('Content-Type', Request.types[type] || type);

        return this;
    },

    accept: function (type) {
        this.set('Accept', Request.types[type] || type);

        return this;
    },

    query: function (query) {
        if (typeof query === 'string') {
            query = qs.parse(query);
        }

        _.extend(this._query, query);

        return this;
    },

    send: function (body) {
        _.extend(this._body, body);

        return this;
    },

    timeout: function (options) {
        return this;
    },

    get: function (field) {
        return this._headers[field.toLowerCase()];
    },

    getHeader: function (field) {
        return this.get(field);
    },

    set: function (field, val) {
        if (_.isPlainObject(field)) {
            // Set each field
            for (let key in field) {
                this.set(key, field[key]);
            }

            return this;
        }

        this._headers[field.toLowerCase()] = val;
        this.headers[field] = val;

        return this;
    },

    unset: function (field) {
        delete this._headers[field.toLowerCase()];
        delete this.headers[field];
        return this;
    },

    abort: function () {
        return this;
    },

    end: function (__method__, callback) {
        if (!this.__end__) {
            console.error('No connection to receiver');
        }

        const search = qs.stringify(this._query);

        // Clone date without references
        const request = JSON.stringify({
            method: __method__,
            headers: this._headers,
            url: this._url + (search ? '?' + search : ''),
            body: this._body
        });

        this.__end__(request, callback);

        // Prevent double call
        this.end = function () {
            return;
        };
    }
}, {
    types: {
        html: 'text/html',
        json: 'application/json',
        xml: 'text/xml',
        urlencoded: 'application/x-www-form-urlencoded',
        'form': 'application/x-www-form-urlencoded',
        'form-data': 'application/x-www-form-urlencoded'
    }
});

module.exports = Request;

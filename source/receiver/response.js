'use strict';

const _ = require('lodash');
const Cla55 = require('cla55');

const Response = Cla55.extend({
    /**
     * Initialize a new "response" `Response`.
     *
     * @api public
     */
    constructor: function () {
        this._headers = {};
        this._status = 404;
        this._body = {};

        this.headers = {};
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

    status: function (status) {
        this._status = status;

        return this;
    },

    send: function (data) {
        this._body = data;

        this.end();
    },

    end: function () {
        if (!this.__end__) {
            console.error('No connection to sender');
        }

        const response = JSON.stringify({
            status: this._status,
            headers: this.headers,
            body: this._body
        });

        this.__end__(response);

        // Prevent double call
        this.end = function () {
            return;
        };
    }
});

module.exports = Response;

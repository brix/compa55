'use strict';

const Cla55 = require('cla55');

const Response = Cla55.extend({
    /**
     * Initialize a new "response" `Response`.
     *
     * @api public
     */
    constructor: function (status, headers, body) {
        this.status = status;
        this.headers = headers;

        if (/^2\d\d$/.test(status)) {
            this.text = body;
            this.body = {};
            this.error = null;

            if (/application\/(.*)?json/.test(this.headers['Content-Type'])) {
                try {
                    this.body = body && JSON.parse(body);
                } catch (error) {
                    this.body = {};
                }
            }
        } else {
            this.body = {};
            this.error = body;
        }
    }
});

module.exports = Response;

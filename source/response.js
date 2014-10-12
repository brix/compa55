/*global require, exports, module, define*/
(function (root, factory) {

    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD: Register as an anonymous module
        return define([], factory);
    }

    if (typeof exports === 'object') {
        // CommonJS
        return factory(require, exports, module);
    }

}(this, function (require, exports, module) {

    'use strict';

    /**
     * Initialize a new "request" `Request`
     * with the given `path` and optional initial `state`.
     *
     * @param {String} path
     * @param {String} base
     * @api public
     */

    function Response() {
        this.constructor.apply(this, arguments);
    }

    Response.prototype.constructor = function Response() {
        this.body = null;
        this.finished = false;
    };

    Response.prototype.end = function end(body) {
        // Prevent double call of end
        if (!this.finished) {
            this.finished = true;

            // Set response body
            if (arguments.length >= 1 && !(body instanceof Error)) {
                this.body = body;
            }
        }
    };

    module.exports = Response;

}));
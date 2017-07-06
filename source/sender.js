
'use strict';

const Cla55 = require('cla55');

module.exports = Cla55.extend({

    /**
     * Initialize `Client`
     *
     * Options:
     *
     *     - `methods`          array of shortcut methods like 'get', 'post' ...
     *
     * @param   {Object}        options
     * @api     public
     */

    constructor: function constructor(options) {
        options = options || {};

        // Set supported methods by this router
        (options.methods || ['get'])
            .forEach(function (method) {
                // Save method in list supported methods as upper case
                method = method.toLowerCase();

                // Generate a shortcut for each supported method
                this[method] = function (path) {
                    /*jslint unparam: true*/
                    return this.request.apply(this, [method].concat([].slice.call(arguments)));
                };

                return method;
            }, this);
    },

    request: function (method, path, data, callback) {
        return this._openRequest(method, path, data, callback);
    },

    connect: function (openRequest) {
        this._openRequest = openRequest;
    }
});

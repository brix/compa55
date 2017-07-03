/*jscs:disable disallowDanglingUnderscores*/
/*global require, exports, module, define*/
/*global setTimeout*/
(function (root, factory) {

    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD: Register as an anonymous module
        return define(['require', 'exports', 'module', 'cla55', './client', './route', './router', './request', './response', './server'], factory);
    }

    if (typeof exports === 'object') {
        // CommonJS
        return factory(require, exports, module);
    }

}(this, function (require, exports, module) {

    'use strict';

    var Cla55 = require('cla55'),
        Client = require('./client'),
        Route = require('./route'),
        Router = require('./router'),
        Request = require('./request'),
        Response = require('./response'),
        Server = require('./server');

    module.exports = Cla55.extend({}, {
        Client: Client,
        Route: Route,
        Router: Router,
        Request: Request,
        Response: Response,
        Server: Server
    });

}));

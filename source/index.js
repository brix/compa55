/*global require, exports, module, define*/
(function (root, factory) {

    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD: Register as an anonymous module
        return define(['./router', './request', './response', './Routify'], factory);
    }

    if (typeof exports === 'object') {
        // CommonJS
        return factory(require, exports, module);
    }

}(this, function (require, exports, module) {

    'use strict';

    return {
        Router: require('./router'),
        Request: require('./request'),
        Response: require('./response'),
        Routify: require('./Routify')
    };

}));

/*jshint node: true*/

'use strict';

module.exports = (function () {

    return {
        Router: require('./router'),
        Request: require('./request'),
        Response: require('./response'),
        Routify: require('./Routify')
    };

}());

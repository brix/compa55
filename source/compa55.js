'use strict';

const Cla55 = require('cla55');
const Route = require('./route');
const Router = require('./router');
const Request = require('./request');
const Response = require('./response');
const Receiver = require('./receiver');
const Sender = require('./sender');

module.exports = Cla55.extend({}, {
    Route: Route,
    Router: Router,
    Request: Request,
    Response: Response,
    Receiver: Receiver,
    Sender: Sender
});

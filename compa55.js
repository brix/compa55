'use strict';

const Cla55 = require('cla55');
const Route = require('./route');
const Router = require('./router');
const Receiver = require('./receiver');
const ReceiverRequest = require('./receiver/request');
const ReceiverResponse = require('./receiver/response');
const Sender = require('./sender');
const SenderRequest = require('./sender/request');
const SenderResponse = require('./sender/response');

module.exports = Cla55.extend({}, {
    Route: Route,
    Router: Router,
    Receiver: Receiver,
    ReceiverRequest: ReceiverRequest,
    ReceiverResponse: ReceiverResponse,
    Sender: Sender,
    SenderRequest: SenderRequest,
    SenderResponse: SenderResponse
});

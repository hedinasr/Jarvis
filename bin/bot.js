'use strict';

var Jarvis = require('../lib/jarvis');

var token = process.env.BOT_API_KEY;

console.log(token);

var jarvisbot = new Jarvis({
    token: token,
    name: 'jarvis'
});

jarvisbot.run();

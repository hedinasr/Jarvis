var Jarvis = require('../lib/jarvis');

var jarvisbot = new Jarvis({
    token: API_TOKEN,
    name: 'jarvis'
});

jarvisbot.run();

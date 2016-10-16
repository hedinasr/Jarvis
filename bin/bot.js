API_TOKEN='xoxb-92001704401-GUM6VhFklxJzhYHTq2coN5cu';

var Jarvis = require('../lib/jarvis');

var jarvisbot = new Jarvis({
    token: API_TOKEN,
    name: 'jarvis'
});

jarvisbot.run();

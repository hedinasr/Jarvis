'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var ical = require('ical');
var Bot = require('slackbots');
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Constructor function. It accepts a settings object which should contain the following keys:
 *      token : the API token of the bot (mandatory)
 *      name : the name of the bot (will default to "jarvis")
 *
 * @param {object} settings
 * @constructor
 *
 * @author Hedi Nasr <h.nsr69@gmail.com>
 */
var Jarvis = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'jarvis';
};

// inherits methods and properties from the Bot constructor
util.inherits(Jarvis, Bot);

/**
 * Run the bot
 * @public
 */
Jarvis.prototype.run = function() {
    Jarvis.super_.call(this, this.settings);

    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};


/**
 * On Start callback, called when the bot connects to the Slack server and access the channel
 * @private
 */
Jarvis.prototype._onStart = function () {
    this._loadBotUser();
    //this._firstRunCheck();
    this.postMessageToUser('hedi', 'hello bro!');
};

/**
 * On message callback, called when a message (of any type) is detected with the real time messaging API
 * @param {object} message
 * @private
 */
Jarvis.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        //this._isChannelConversation(message) &&
        //!this._isFromJarvisBot(message) &&
        this._isMentioningJarvis(message)
       ) {
        var self = this;
        this._getPlanning(function(err, courses) {
            if (!err) {
                for (var c in courses) {
                    var course = courses[c];
                    var message = course.summary + ' in ' + course.location + ' at ' + course.start.getDate();
                    self.postMessageToUser('hedi', message);
                }
            }
        });
    }
};

/**
 * Loads the user object representing the bot
 * @private
 */
Jarvis.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

/**
 * Download ADE iCalendar
 * @private
 */
Jarvis.prototype._getPlanning = function (callback) {
    var now = new Date();
    var courses = [];
    var uri = 'http://adelb.univ-lyon1.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=36045,10052,10054,10055,10057,10059,10061,10062,10063,10066,10067,10068,33892,34295,34296,34297,34298,34299&projectId=3&calType=ical&firstDate=2016-10-03&lastDate=2017-06-30';
    ical.fromURL(uri, {}, function(err, data) {
        if (err)
            return callback(err);
        for (var k in data){
            var ev = data[k];
            if (data.hasOwnProperty(k)) {
                var evDate = new Date(ev.start);
                if (evDate.getFullYear() === now.getFullYear() &&
                    evDate.getMonth() === now.getMonth() &&
                    evDate.getDate() === now.getDate()) {
                    courses.push(ev);
                }
            }
        }
        return callback(null, courses);
    });
};


/**
 * Check if the first time the bot is run. It's used to send a welcome message into the channel
 * @private
 */
Jarvis.prototype._firstRunCheck = function () {
    // this is a first run
    this._welcomeMessage();
};

/**
 * Sends a welcome message in the channel
 * @private
 */
Jarvis.prototype._welcomeMessage = function () {
    this.postMessageToChannel(this.channels[0].name, 'Hi guys!' +
        '\n Just say `jarvis` or `' + this.name + '` to invoke me!',
        {as_user: true});
};

/**
 * Util function to check if a given real time message object represents a chat message
 * @param {object} message
 * @returns {boolean}
 * @private
 */
Jarvis.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

/**
 * Util function to check if a given real time message object is directed to a channel
 * @param {object} message
 * @returns {boolean}
 * @private
 */
Jarvis.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C'
    ;
};

/**
 * Util function to check if a given real time message is mentioning Jarvis or the jarvisBot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
Jarvis.prototype._isMentioningJarvis = function (message) {
    return message.text.toLowerCase().indexOf('jarvis') > -1 ||
        message.text.toLowerCase().indexOf(this.name) > -1;
};

/**
 * Util function to check if a given real time message has ben sent by jarvis
 * @param {object} message
 * @returns {boolean}
 * @private
 */
Jarvis.prototype._isFromJarvisBot = function (message) {
    return message.user === this.user.id;
};

/**
 * Util function to get the name of a channel given its id
 * @param {string} channelId
 * @returns {Object}
 * @private
 */
Jarvis.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};

module.exports = Jarvis;

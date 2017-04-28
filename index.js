var util = require('util'),
    request = require('request'),
    winston = require('winston'),
    webColors = {
        "black": "000",
        "red": "f00",
        "green": "0f0",
        "yellow": "ff0",
        "blue": "00f",
        "magenta": "f0f",
        "cyan": "0ff",
        "white": "fff",
        "gray": "808080",
        "grey": "808080"
    }

Office365ConnectorHook = winston.transports.Office365ConnectorHook = function (options) {
    this.name = options.name || 'office365connectorhook';
    this.level = options.level || 'silly';

    this.hookUrl = options.hookUrl || null;

    this.webColors = options.colors || {};

    this.prependLevel = options.prependLevel === undefined ? true : options.prependLevel;
    this.appendMeta = options.appendMeta === undefined ? true : options.appendMeta;

    this.formatter = options.formatter || null;
};

util.inherits(Office365ConnectorHook, winston.Transport);

Office365ConnectorHook.prototype.log = function (level, msg, meta, callback) {

    var color = winston.config.allColors[level],
        themeColor = this.webColors[level] || webColors[color],
        title = "";

    // console.debug(themeColor);

    var message = '';

    if (this.prependLevel) {
        message += '[' + level + ']\n';
    }

    message += msg;

    if (this.appendMeta && meta) {
        title = meta.title || "";
        delete meta["title"];
        var props = Object.getOwnPropertyNames(meta);
        if (props.length) {
            // http://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify#comment57014279_26199752
            message += ' ```' + JSON.stringify(meta, props, 2) + '```';
        }
    }

    if (typeof this.formatter === 'function') {
        message = this.formatter({
            level: level,
            message: message,
            meta: meta
        });
    }

    var payload = {
        title: title,
        text: message,
        themeColor: themeColor
    };

    request
        .post(this.hookUrl)
        .json(payload)
        .on('response', function (response) {
            if (response.statusCode === 200) {
                callback(null, true);
                return;
            }

            callback('Server responded with ' + response.statusCode);
        })
        .on('error', function (error) {
            callback(error);
        });
};

module.exports = Office365ConnectorHook;
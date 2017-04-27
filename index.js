var util = require('util'),
    request = require('request'),
    winston = require('winston'),

    Office365ConnectorHook = winston.transports.Office365ConnectorHook = function (options) {
        this.name = options.name || 'office365connectorhook';
        this.level = options.level || 'info';

        this.hookUrl = options.hookUrl || null;

        this.prependLevel = options.prependLevel === undefined ? true : options.prependLevel;
        this.appendMeta = options.appendMeta === undefined ? true : options.appendMeta;

        this.formatter = options.formatter || null;
    };

util.inherits(Office365ConnectorHook, winston.Transport);

Office365ConnectorHook.prototype.log = function (level, msg, meta, callback) {

    var message = '';

    if (this.prependLevel) {
        message += '[' + level + '] ';
    }

    message += msg;

    if (
        this.appendMeta &&
        meta &&
        Object.getOwnPropertyNames(meta).length
    ) {
        message += ' ```' + JSON.stringify(meta, null, 2) + '```';
    }

    if (typeof this.formatter === 'function') {
        message = this.formatter({
            level: level,
            message: message,
            meta: meta
        });
    }

    var payload = {
        text: message
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
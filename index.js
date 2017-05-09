var util = require('util'),
    queue = require('./queue'),
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
    },

    Office365ConnectorHook = winston.transports.Office365ConnectorHook = function (options) {
        this.name = options.name || 'office365connectorhook';
        this.level = options.level || 'silly';

        this.hookUrl = options.hookUrl || null;

        this.webColors = options.colors || {};

        this.prependLevel = options.prependLevel === undefined ? true : options.prependLevel;
        this.appendMeta = options.appendMeta === undefined ? true : options.appendMeta;

        this.formatter = options.formatter || null;
    },
    q = queue({ concurrency: 1, autostart: true });

util.inherits(Office365ConnectorHook, winston.Transport);

ensureCallback = function (cb1, cb2) {
    return function () {
        try {
            cb1.apply(null, arguments);
        }
        finally {
            cb2();
        }
    }
}

deferredExecute = function (url, payload, callback) {
    return function (cb) {
        var safeCallback = ensureCallback(callback, cb);
        request
            .post(url)
            .json(payload)
            .on('response', function (response) {
                if (response.statusCode === 200) {
                    safeCallback(null, true);
                    return;
                }

                safeCallback('Server responded with ' + response.statusCode);
            })
            .on('error', function (error) {
                safeCallback(error);
            });
    }
}

Office365ConnectorHook.prototype.log = function (level, msg, meta, callback) {
    var color = winston.config.allColors[level],
        themeColor = this.webColors[level] || webColors[color],
        title = "";

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

    q.push(deferredExecute(this.hookUrl, payload, callback));
};

module.exports = Office365ConnectorHook;
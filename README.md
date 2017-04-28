# winston-office365-connector-hook [![Build Status](https://travis-ci.org/SukantGujar/winston-office365-connector-hook.svg?branch=master)](https://travis-ci.org/SukantGujar/winston-office365-connector-hook)
A Winston transport hook to send logs over to a Office 365 Connector, e.g. Microsoft Teams channel.

Heavily based on [winston-slack-hook](https://github.com/fahad19/winston-slack-hook) by [fahad19](https://github.com/fahad19).

## Install

```
$ npm install --save winston winston-office365-connector-hook
```

## Requirements

* Use [winston](https://github.com/winstonjs/winston)
* Get a Webhook URL by setting up an [Incoming Connector](https://msdn.microsoft.com/en-us/microsoft-teams/connectors) for the Teams channel you wish to send the logs to. 

> Note that Office 365 Connector Webhook URL is tied to a given channel, so you don't need to specify a channel name separately.

## Usage

### Basic

```js
var winston = require('winston');
var Office365ConnectorHook = require('winston-office365-connector-hook');

var Logger = winston.Logger;
var Console = winston.transports.Console;

var logger = new Logger({
  transports: [
    new Console({}),
    new Office365ConnectorHook({
      hookUrl: 'https://outlook.office.com/webhook/XXXXXXXXXXXXX' // No need for a channel name
    })
  ]
});

logger.info('I am being logged here'); // will be sent to both console and Teams channel
```

### Options

Require:

* `hookUrl`: Connector Webhook URL to post to

Optional:

* `prependLevel`: set to `true` by default, sets `[level]` at the beginning of the message
* `appendMeta`: set to `true` by default, sets stringified `meta` at the end of the message
* `formatter(options)`: function for transforming the message before posting to Slack
* `colors`: use this to set custom colors to log levels. Note that you MUST use hex format, not names.
  e.g.
```
  "colors": {
     "debug": "4256f4",
     "error": "f00"
   }
```
> Behind the scenes, the level color is sent as the [`themeColor`](https://dev.outlook.com/Connectors/Reference#color) property of the card.

### Markdown support in messages

Channel messages support Markdown syntax. Any formatting is sent *as-is* to the Channel.

    logger.info('# Seriously!?\n > This is cool!', { title: 'You can use Markdown in messages.' });

### Setting card title

You can set a [`title`](https://dev.outlook.com/Connectors/Reference#title) for the card by sending it as a part of the `meta` hash:

    logger.info('This text appears in card body.', { title: 'My puny title' });

### Formatter

Messages can be formatted further before posting to the channel:

```js
var logger = new Logger({
  transports: [
    new Office365ConnectorHook({
      hookUrl: 'https://outlook.office.com/webhook/XXXXXXXXXXXXX'

      formatter: function (options) {
        var message = options.message; // original message

        // var level = options.level;
        // var meta = options.meta;

        // do something with the message

        return message;
      }
    })
  ]
});
```
### Roadmap
See [here](ROADMAP.md)

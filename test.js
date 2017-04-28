var Office365ConnectorHook = require("./index.js"),
    winston = require('winston'),
    Logger = winston.Logger,
    Console = winston.transports.Console,
    hookUrl = process.env.HOOK_URL;

if (!hookUrl) {
    console.warn("No process.env.HOOK_URL set. Please set it to your Connector Webhook URL before running this test.");
    process.exit();
}

var logger = new Logger({
    transports: [
        new Console({}),
        new Office365ConnectorHook({
            "hookUrl": hookUrl
        })
    ]
});

logger.info('I am being logged here'); // will be sent to both console and channel
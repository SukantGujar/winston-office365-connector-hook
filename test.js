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
            "hookUrl": hookUrl,
            "colors": {
                "debug": "FFFFFF"
            }
        })
    ]
});

// will be sent to both console and channel
logger.log('debug', 'Starting tests...');
logger.info('This is a test log from Winston.');
logger.info('This text appears in card body.', { title: 'You can send card titles too!' });
logger.info('# Seriously!?\n > This is cool!', { title: 'You can use Markdown in error messages.' });
logger.warn('Warning! An error test coming up!');
try {
    throw new Error("Everything's alright, just testing error logging.");
}
catch (err) {
    logger.error(err.message, err);
}
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
            "level": "debug",
            "hookUrl": hookUrl,
            "colors": {
                "debug": "FFFFFF"
            }
        })
    ]
});

function testOnce(val, i) {
    var iteration = 'Iteration - ' + (i + 1) + " ";
    logger.log('debug', iteration + 'Starting tests...');
    logger.info(iteration + 'This is a test log from Winston.');
    logger.info(iteration + 'This text appears in card body.', { title: 'My puny title' });
    logger.info(iteration + '# Seriously!?\n > This is cool!', { title: 'You can use Markdown in messages.' });
    logger.warn(iteration + 'Warning! An error test coming up!');
    try {
        throw new Error(iteration + "Everything's alright, just testing error logging.");
    }
    catch (err) {
        logger.error(err.message, err);
    }
}

var iterations = new Array(5).fill(1);
iterations.forEach(testOnce);
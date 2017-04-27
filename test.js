var Office365ConnectorHook = require("./index.js"),
    winston = require('Winston');

var Logger = winston.Logger;
var Console = winston.transports.Console;

var logger = new Logger({
    transports: [
        new Console({}),
        new Office365ConnectorHook({
            hookUrl: 'https://outlook.office.com/webhook/28b98568-d712-43b0-acab-dc662d48af10@6afcd346-7cb2-46db-897d-c639dbdf0449/IncomingWebhook/292e9954dc38453ab8dca787d4dae2c3/26b2f7b0-a26a-43d3-b4e8-ccd198b6b3ef'
        })
    ]
});

logger.info('I am being logged here'); // will be sent to both console and Slack
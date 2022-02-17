const appInsights = require('applicationinsights');
const CONF = require('@hmcts/properties-volume').addTo(require('config'));
const setupSecrets = require('app/core/setup/setupSecrets');

// Populate secrets from filesystem when not automated testing
if (CONF.environment !== 'testing') {
  setupSecrets.setup();
}

const listenForConnections = true;

const logger = require('@hmcts/nodejs-logging').Logger.getLogger(__filename);
logger.info(`

              ==========================================================================================
                Cookie Domain: ${CONF.cookieDomain}
              ==========================================================================================
`);

if (CONF.applicationInsights.instrumentationKey) {
  appInsights.setup(CONF.applicationInsights.instrumentationKey)
    .setAutoCollectConsole(true, true)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .setSendLiveMetrics(true)
    .start();
  appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = 'div-pfe';
}

const app = require('./app');

const { http } = app.init(listenForConnections);

process.on('SIGTERM', () => {
  http.close(() => {
    process.exit(0); // eslint-disable-line no-process-exit
  });
});

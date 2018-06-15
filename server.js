const appInsights = require('applicationinsights');
const CONF = require('config');

const listenForConnections = true;

if (CONF.applicationInsights.instrumentationKey) {
  appInsights.setup(CONF.applicationInsights.instrumentationKey)
    .setAutoCollectConsole(true, true)
    .start();
}

const app = require('./app');

const { http } = app.init(listenForConnections);

process.on('SIGTERM', () => {
  http.close(() => {
    process.exit(0); // eslint-disable-line no-process-exit
  });
});

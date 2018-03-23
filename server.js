const app = require('./app');

const { http } = app.init();

process.on('SIGTERM', () => {
  http.close(() => {
    process.exit(0); // eslint-disable-line no-process-exit
  });
});

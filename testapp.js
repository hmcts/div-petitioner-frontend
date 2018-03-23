const express = require('express');

const httpPort = '3000';
const PORT = process.env.PORT || httpPort;

exports.init = () => {
  const app = express();

  app.get('/', (req, res) => {
    return res.send('Hello World!');
  });

  app.get('/health', (req, res) => {
    return res.send('UP');
  });

  app.get('/healthcheck', (req, res) => {
    return res.send('UP');
  });

  const http = app.listen(PORT);

  process.emit('application-log', {
    level: 'INFO',
    message: 'divorce-application-started',
    fields: { host: `https://localhost:${PORT}` }
  });

  return { app, http };
};
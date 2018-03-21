const express = require('express');

const PORT = process.env.HTTP_PORT || CONF.http.port;

exports.init = () => {
  const app = express();

  app.get('/', (req, res) => res.send('Hello World!'))

  app.get('/health', (req, res) => res.send('UP'))

  app.get('/healthcheck', (req, res) => res.send('UP'))

  let http = app.listen(PORT);

  process.emit('application-log', {
    level: 'INFO',
    message: 'divorce-application-started',
    fields: { host: `https://localhost:${PORT}` }
  });

  return { app, http, steps };
}
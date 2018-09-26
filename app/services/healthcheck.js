const express = require('express');

const router = express.Router();
const healthcheck = require('@hmcts/nodejs-healthcheck');
const os = require('os');
const ioRedis = require('ioredis');
const config = require('config');

const logger = require('app/services/logger').logger(__filename);

const client = ioRedis.createClient(
  config.services.redis.host,
  { enableOfflineQueue: false }
);
client.on('error', error => {
  logger.error(error);
});

router.get('/health', healthcheck.configure({
  buildInfo: {
    name: config.service.name,
    host: os.hostname(),
    uptime: process.uptime()
  }
}));

module.exports = router;

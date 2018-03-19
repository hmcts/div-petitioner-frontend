const express = require('express');

const router = express.Router();
const healthcheck = require('@hmcts/nodejs-healthcheck');
const os = require('os');
const ioRedis = require('ioredis');
const config = require('config');

const outputs = require('@hmcts/nodejs-healthcheck/healthcheck/outputs');
const { OK } = require('http-status-codes');
const logger = require('@hmcts/nodejs-logging').getLogger(__filename);


const client = ioRedis.createClient(
  config.services.redis.host,
  { enableOfflineQueue: false }
);
client.on('error', error => {
  logger.error(error);
});

router.get('/health', healthcheck.configure({
  checks: {
    redis: healthcheck.raw(() => {
      return client.ping().then(_ => {
        return healthcheck.status(_ === 'PONG');
      })
        .catch(error => {
          logger.error(`Health check failed on redis: ${error}`);
        });
    }),

    'idam-authentication': healthcheck.web(config.services.idamAuthentication.health, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        logger.error(`Health check failed on idam-authentication: ${error}`);
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }),

    'idam-app': healthcheck.web(config.services.idamApp.health, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        logger.error(`Health check failed on idam-app: ${error}`);
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }),
    'feature-toggle-api': healthcheck.web(config.services.featureToggleApi.health, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        logger.error(`Health check failed on feature-toggle-api: ${error}`);
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }),
    'evidence-management-client-api': healthcheck.web(config.evidenceManagmentClient.health, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        logger.error(`Health check failed on evidence-management-client-api: ${error}`);
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }),
    'transformation-api': healthcheck.web(config.services.transformation.health, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        logger.error(`Health check failed on transformation-api: ${error}`);
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }),
    'service-auth-provider-api': healthcheck.web(config.services.serviceAuthProvider.health, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        logger.error(`Health check failed on service-auth-provider-api: ${error}`);
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }),
    'payment-api': healthcheck.web(config.services.payment.health, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        logger.error(`Health check failed on payment-api: ${error}`);
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }),
    feeRegister: healthcheck.web(config.services.feeRegister.health, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        logger.error(`Health check failed on fee register: ${error}`);
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }),
    features: healthcheck.raw(req => {
      return healthcheck.status(Object.keys(req.features) != 0, req.features); // eslint-disable-line eqeqeq
    })
  },
  buildInfo: {
    name: config.service.name,
    host: os.hostname(),
    uptime: process.uptime()
  }
}));

module.exports = router;

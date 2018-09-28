const express = require('express');

const router = express.Router();
const healthcheck = require('@hmcts/nodejs-healthcheck');
const os = require('os');
const ioRedis = require('ioredis');
const config = require('config');

const outputs = require('@hmcts/nodejs-healthcheck/healthcheck/outputs');
const { OK } = require('http-status-codes');
const logger = require('app/services/logger').logger(__filename);


const client = ioRedis.createClient(
  config.services.redis.host,
  { enableOfflineQueue: false }
);
client.on('error', error => {
  logger.error(error);
});

const options = {
  timeout: config.health.timeout,
  deadline: config.health.deadline
};

router.get('/health', healthcheck.configure({
  checks: {
    redis: healthcheck.raw(() => {
      return client.ping().then(_ => {
        return healthcheck.status(_ === 'PONG');
      })
        .catch(error => {
          logger.error({
            message: 'Health check failed on redis:',
            error
          });
        });
    }),
    'idam-authentication': healthcheck.web(config.services.idamAuthentication.health, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        if (error) {
          logger.error({
            message: 'Health check failed on idam-authentication:',
            error
          });
        }
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }, options),
    'idam-app': healthcheck.web(config.services.idamApp.health, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        if (error) {
          logger.error({
            message: 'Health check failed on idam-app:',
            error
          });
        }
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }, options),
    'evidence-management-client-api': healthcheck.web(config.evidenceManagmentClient.health, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        if (error) {
          logger.error({
            message: 'Health check failed on evidence-management-client-api:',
            error
          });
        }
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }, options),
    'case-orchestration': healthcheck.web(config.services.transformation.health, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        if (error) {
          logger.error({
            message: 'Health check failed on case-orchestration:',
            error
          });
        }
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }, options),
    'service-auth-provider-api': healthcheck.web(config.services.serviceAuthProvider.health, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        if (error) {
          logger.error({
            message: 'Health check failed on service-auth-provider-api:',
            error
          });
        }
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }, options),
    'payment-api': healthcheck.web(config.services.payment.health, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        if (error) {
          logger.error({
            message: 'Health check failed on payment-api:',
            error
          });
        }
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }, options),
    feesAndPayments: healthcheck.web(config.services.feesAndPayments.health, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        if (error) {
          logger.error({
            message: 'Health check failed on fees and payments service:',
            error
          });
        }
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }, options)
  },
  buildInfo: {
    name: config.service.name,
    host: os.hostname(),
    uptime: process.uptime()
  }
}));

module.exports = router;

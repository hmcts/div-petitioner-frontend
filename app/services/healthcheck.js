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

const healthOptions = message => {
  return {
    callback: (error, res) => { // eslint-disable-line id-blacklist
      if (error) {
        logger.error({ message, error });
      }
      return !error && res.status === OK ? outputs.up() : outputs.down(error);
    },
    timeout: config.health.timeout,
    deadline: config.health.deadline
  };
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
    'idam-authentication': healthcheck.web(config.services.idamAuthentication.health,
      healthOptions('Health check failed on idam-authentication:')
    ),
    'idam-app': healthcheck.web(config.services.idamApp.health,
      healthOptions('Health check failed on idam-app:')
    ),
    'evidence-management-client-api': healthcheck.web(config.evidenceManagmentClient.health,
      healthOptions('Health check failed on evidence-management-client-api:')
    ),
    'case-orchestration': healthcheck.web(config.services.transformation.health,
      healthOptions('Health check failed on case-orchestration:')
    ),
    'service-auth-provider-api': healthcheck.web(config.services.serviceAuthProvider.health,
      healthOptions('Health check failed on service-auth-provider-api:')
    ),
    'payment-api': healthcheck.web(config.services.payment.health,
      healthOptions('Health check failed on payment-api:')
    ),
    feesAndPayments: healthcheck.web(config.services.feesAndPayments.health,
      healthOptions('Health check failed on fees and payments service:')
    )
  },
  buildInfo: {
    name: config.service.name,
    host: os.hostname(),
    uptime: process.uptime()
  }
}));

module.exports = router;

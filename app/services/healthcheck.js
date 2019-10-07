const healthcheck = require('@hmcts/nodejs-healthcheck');
const os = require('os');
const ioRedis = require('ioredis');
const config = require('config');

const outputs = require('@hmcts/nodejs-healthcheck/healthcheck/outputs');
const { OK } = require('http-status-codes');
const logger = require('app/services/logger').logger(__filename);


const client = ioRedis.createClient(
  config.secrets.div.redis-connection-string,
  { enableOfflineQueue: false }
);
client.on('error', error => {
  logger.errorWithReq(null, 'health_check_error', 'Health check failed on redis', error);
});

const healthOptions = message => {
  return {
    callback: (error, res) => { // eslint-disable-line id-blacklist
      if (error) {
        logger.errorWithReq(null, 'health_check_error', message, error);
      }
      return !error && res.status === OK ? outputs.up() : outputs.down(error);
    },
    timeout: config.health.timeout,
    deadline: config.health.deadline
  };
};

const setup = app => {
  healthcheck.addTo(app, {
    checks: {
      redis: healthcheck.raw(() => {
        return client.ping().then(_ => {
          return healthcheck.status(_ === 'PONG');
        })
          .catch(error => {
            logger.errorWithReq(null, 'Health check failed on redis:', error);
          });
      }),
      'idam-api': healthcheck.web(config.services.idamApp.health,
        healthOptions('Health check failed on idam-api:')
      ),
      'evidence-management-client': healthcheck.web(config.evidenceManagmentClient.health,
        healthOptions('Health check failed on evidence-management-client:')
      ),
      'case-orchestration-service': healthcheck.web(config.services.transformation.health,
        healthOptions('Health check failed on case-orchestration-service:')
      ),
      'service-auth-provider': healthcheck.web(config.services.serviceAuthProvider.health,
        healthOptions('Health check failed on service-auth-provider:')
      ),
      'payment-api': healthcheck.web(config.services.payment.health,
        healthOptions('Health check failed on payment-api:')
      ),
      'fees-and-payments-service': healthcheck.web(config.services.feesAndPayments.health,
        healthOptions('Health check failed on fees and payments service:')
      )
    },
    buildInfo: {
      name: config.service.name,
      host: os.hostname(),
      uptime: process.uptime()
    }
  });
};

module.exports = { setup };

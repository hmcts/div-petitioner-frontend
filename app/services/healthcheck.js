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
      'evidence-management-client': healthcheck.web(`${config.evidenceManagementClient.url}/health`,
        healthOptions('Health check failed on evidence-management-client:')
      ),
      'case-orchestration-service': healthcheck.web(`${config.services.transformation.baseUrl}/health`,
        healthOptions('Health check failed on case-orchestration-service:')
      ),
      'fees-and-payments-service': healthcheck.web(`${config.services.feesAndPayments.baseUrl}/health`,
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

const CONF = require('config');
const feesAndPaymentsRegisterService = require('app/services/feesAndPaymentsService');
const mockFeesAndPaymentsService = require('app/services/mocks/feesAndPaymentsService');

const logger = require('app/services/logger').logger(__filename);
const ioRedis = require('ioredis');
const ioRedisMock = require('app/services/mocks/ioRedis');

const redisHost = CONF.services.redis.host;
const twentyFourHours = 86400;

const feeTypes = {
  applicationFee: 'petition-issue-fee',
  amendFee: 'amend-fee'
};

// redisClient is a let so it can be rewired in tests
let redisClient = {};

if (CONF.environment === 'testing') {
  redisClient = ioRedisMock();
} else {
  redisClient = new ioRedis(redisHost); // eslint-disable-line prefer-const
}

redisClient.on('error', error => {
  logger.errorWithReq(null, 'redis_error', 'Failed to connect to Redis', error.message);
});

const getFeeFromFeesAndPayments = (req, feeName) => {
  const service = CONF.deployment_env === 'local' ? mockFeesAndPaymentsService : feesAndPaymentsRegisterService;

  return service.getFee(feeTypes[feeName])
    .then(response => {
      // set fee returned from Fees and payments service
      logger.infoWithReq(req, 'fees_code', 'Fee code set to', response.feeCode);
      CONF.commonProps[feeName].feeCode = response.feeCode;
      logger.infoWithReq(req, 'fees_version', 'Fee version set to', response.version);
      CONF.commonProps[feeName].version = response.version;
      logger.infoWithReq(req, 'fees_amount', 'Fee amount set to', response.amount);
      CONF.commonProps[feeName].amount = response.amount;

      // cache fee for 24 hours
      redisClient.set(`commonProps.${feeName}`, JSON.stringify(CONF.commonProps[feeName]), 'EX', twentyFourHours);
    });
};

const updateApplicationFeeMiddleware = (req, res, next) => {
  redisClient.get('commonProps.applicationFee')
    .then(response => {
      if (response) {
        CONF.commonProps.applicationFee = JSON.parse(response);
        return Promise.resolve();
      }
      return getFeeFromFeesAndPayments(req, 'applicationFee');
    })
    .then(next)
    .catch(error => {
      logger.errorWithReq(req, 'fees_error', 'Error retrieving applicationFee', error.message);
      res.redirect('/generic-error');
    });
};


const updateAmendFeeMiddleware = (req, res, next) => {
  redisClient.get('commonProps.amendFee')
    .then(response => {
      if (response) {
        CONF.commonProps.amendFee = JSON.parse(response);
        return true;
      }
      return getFeeFromFeesAndPayments(req, 'amendFee');
    })
    .then(() => {
      next();
    })
    .catch(error => {
      logger.errorWithReq(req, 'fees_error', 'Error retrieving amendFee', error.message);
      res.redirect('/generic-error');
    });
};


module.exports = { updateApplicationFeeMiddleware, updateAmendFeeMiddleware };

const CONF = require('config');
const feesAndPaymentsRegisterService = require('app/services/feesAndPaymentsService');
const mockFeesAndPaymentsService = require('app/services/mocks/feesAndPaymentsService');

const logger = require('app/services/logger').logger(__filename);
const ioRedis = require('ioredis');
const ioRedisMock = require('app/services/mocks/ioRedis');

const redisHost = CONF.services.redis.host;

// redisClient is a let so it can be rewired in tests
let redisClient = {};

if (CONF.environment === 'testing') {
  redisClient = ioRedisMock();
} else {
  redisClient = new ioRedis(redisHost); // eslint-disable-line prefer-const
}

redisClient.on('error', logger.error);

const getFeeFromFeesAndPayments = () => {
  const service = CONF.deployment_env === 'local' ? mockFeesAndPaymentsService : feesAndPaymentsRegisterService;

  return service.get()
    .then(response => {
      // set fee returned from Fees and payments service
      logger.info('fees_code', 'Fee code set to', response.feeCode);
      CONF.commonProps.applicationFee.feeCode = response.feeCode;
      logger.info('fees_version', 'Fee version set to', response.version);
      CONF.commonProps.applicationFee.version = response.version;
      logger.info('fees_amount', 'Fee amount set to', response.amount);
      CONF.commonProps.applicationFee.amount = response.amount;
      return true;
    });
};

const updateApplicationFeeMiddleware = (req, res, next) => {
  redisClient.get('commonProps.applicationFee.amount')
    .then(response => {
      if (response) {
        CONF.commonProps.applicationFee = JSON.parse(response);
        return true;
      }
      return getFeeFromFeesAndPayments();
    })
    .then(() => {
      next();
    })
    .catch(error => {
      logger.error('fees_error', 'Error retrieving fees', error.message);
      res.redirect('/generic-error');
    });
};

module.exports = { updateApplicationFeeMiddleware };

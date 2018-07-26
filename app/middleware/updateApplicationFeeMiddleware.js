const CONF = require('config');
const feeRegisterService = require('app/services/feeRegisterService');
const mockFeeReigsterService = require('app/services/mocks/feeRegisterService');
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

const applicationFeeQueryParams = 'service=divorce&jurisdiction1=family&jurisdiction2=family%20court&channel=default&event=issue';

const getFeeFromService = () => {
  const service = CONF.deployment_env === 'local' ? mockFeeReigsterService : feeRegisterService;
  const options = { queryParameters: applicationFeeQueryParams };

  return service.get(options)
    .then(response => {
      // set fee returned from fee register to global CONF
      CONF.commonProps.applicationFee = response;
      return redisClient.set('commonProps.applicationFee', JSON.stringify(response));
    })
    .then(() => {
      return redisClient.expire('commonProps.applicationFee', CONF.services.feeRegister.TTL);
    });
};

const getFeeCodeFromFeesAndPayments = () => {
  const service = CONF.deployment_env === 'local' ? mockFeesAndPaymentsService : feesAndPaymentsRegisterService;

  return service.get()
    .then(response => {
      // set fee returned from fee register to global CONF
      logger.info(' Fee code set to ', response.feeCode);
      CONF.commonProps.code = response.feeCode;
      logger.info(' Fee version set to ', response.version);
      CONF.commonProps.version = response.version;
      return true;
    })
    .catch(error => {
      logger.error(error);
    });
};

const updateApplicationFeeMiddleware = (req, res, next) => {
  redisClient.get('commonProps.applicationFee')
    .then(response => {
      if (response) {
        CONF.commonProps.applicationFee = JSON.parse(response);
        return true;
      }
      return getFeeFromService();
    })
    .then(() => {
      getFeeCodeFromFeesAndPayments();
      return true;
    })
    .then(() => {
      next();
    })
    .catch(error => {
      logger.error(error);
      res.redirect('/generic-error');
    });
};

module.exports = { updateApplicationFeeMiddleware };

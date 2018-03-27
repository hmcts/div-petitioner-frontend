const CONF = require('config');
const feeRegisterService = require('app/services/feeRegisterService');
const mockFeeReigsterService = require('app/services/mocks/feeRegisterService');
const logger = require('@hmcts/nodejs-logging').getLogger(__filename);
const ioRedis = require('ioredis');
const ioRedisMock = require('app/services/mocks/ioRedis');

const redisHost = CONF.services.redis.host;

// redisClient is a let so it can be rewired in tests
let redisClient = {};

if (process.env.NODE_ENV === 'testing') {
  redisClient = ioRedisMock();
} else {
  redisClient = new ioRedis(redisHost); // eslint-disable-line prefer-const
}

redisClient.on('error', error => {
  logger.error(error);
});

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
      next();
    })
    .catch(error => {
      logger.error(`Error retrieving fee from Fee registry: ${error}`);
      res.redirect('/generic-error');
    });
};

module.exports = { updateApplicationFeeMiddleware };
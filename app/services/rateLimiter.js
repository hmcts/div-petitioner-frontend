const CONF = require('config');
const ioRedis = require('ioredis');
const expressLimiter = require('express-limiter');
const logger = require('app/services/logger').logger(__filename);

const redisHost = CONF.secrets.div.redis-connection-string;

module.exports = app => {
  const client = ioRedis.createClient(redisHost);
  client.on('error', error => {
    logger.errorWithReq(null, 'Failed to connect to Redis', error);
  });
  const limiter = expressLimiter(app, client);

  return limiter({
    lookup: ['connection.remoteAddress'],
    // 150 requests per hour
    total: CONF.rateLimiter.total,
    expire: CONF.rateLimiter.expire
  });
};

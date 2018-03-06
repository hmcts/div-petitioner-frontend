const CONF = require('config');
const ioRedis = require('ioredis');
const expressLimiter = require('express-limiter');

const redisHost = process.env.REDISCLOUD_URL || CONF.services.redis.host;

module.exports = app => {
  const client = ioRedis.createClient(redisHost);
  const limiter = expressLimiter(app, client);

  return limiter({
    lookup: ['connection.remoteAddress'],
    // 150 requests per hour
    total: CONF.rateLimiter.total,
    expire: CONF.rateLimiter.expire
  });
};
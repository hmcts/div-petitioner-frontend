const CONF = require('config');
const session = require('express-session');
const Redis = require('connect-redis')(session);
const sessionSerializer = require('app/services/sessionSerializer');
const logger = require('app/services/logger').logger(__filename);
const ioRedis = require('ioredis');

const secret = CONF.secret;
const redisHost = process.env.REDISCLOUD_URL || CONF.services.redis.host;
const ttl = CONF.session.ttl;
const cookieSecure = process.env.PUBLIC_PROTOCOL === 'https';

const sessions = module.exports = { // eslint-disable-line no-multi-assign

  prod: (req, res, next) => {
    if (process.env.NODE_ENV === 'testing') {
      return sessions.inmemory();
    }

    return sessions.redis(req, res, next);
  },
  redis: () => {
    const client = ioRedis.createClient(redisHost);

    client.on('connect', () => {
      logger.info({ message: 'Connected to Redis' });
    });

    client.on('error', error => {
      logger.error({
        message: 'Failed to connect to Redis',
        error
      });
    });

    return (req, res, next) => {
      let serializer = {};
      // each user uses their own serializer as encryption and
      // decryption is based on user specific values
      // serializer can fail to build so handle error if it fails
      try {
        serializer = sessionSerializer.createSerializer(req, res);
      } catch (error) {
        logger.error(error);
        return res.redirect('/generic-error');
      }

      const redisStore = new Redis({ client, ttl, serializer });

      const sessionHandled = error => {
        if (error) {
          const isOnGenericErrorPage = req.originalUrl === '/generic-error';
          if (!isOnGenericErrorPage) {
            return res.redirect('/generic-error');
          }
        }
        return next();
      };

      return session({
        secret,
        store: redisStore,
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: cookieSecure,
          httpOnly: true,
          domain: req.hostname
        }
      })(req, res, sessionHandled);
    };
  },

  inmemory: () => {
    return session({
      secret,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }
    });
  }

};

const CONF = require('config');
const appRouter = require('@hmcts/div-app-router')(CONF.appRouter);

// Setup should happen at server init
const routingMiddleware = (req, res, next) => {
  if (CONF.environment === 'testing') {
    return next();
  }

  return appRouter.middleware(req, res, next);
};

module.exports = routingMiddleware;
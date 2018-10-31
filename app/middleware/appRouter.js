const config = require('config');
const divAppRouter = require('@hmcts/div-app-router');

// Setup appRouter
divAppRouter.setup(config.appRouter);

module.exports = {
  middleware: divAppRouter.router.middleware,
  entryMiddleware: divAppRouter.router.entryMiddleware
};
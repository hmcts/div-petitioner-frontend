const DestroySessionStep = require('app/core/DestroySessionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');

module.exports = class Done extends DestroySessionStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  get url() {
    return '/done';
  }

  get middleware() {
    return [
      ...super.middleware,
      applicationFeeMiddleware.updateApplicationFeeMiddleware
    ];
  }

  * interceptor(ctx, session) {
    ctx.numberOfCopies = '3';
    const adultery = session.reasonForDivorce === 'adultery';
    if (adultery && session.reasonForDivorceAdulteryWishToName === 'Yes') {
      ctx.numberOfCopies = '4';
    }

    yield super.interceptor(ctx, session);

    return ctx;
  }
};

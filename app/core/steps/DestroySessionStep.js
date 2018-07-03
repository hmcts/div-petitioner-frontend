const Step = require('./Step');
const idam = require('app/services/idam');
const initSession = require('app/middleware/initSession');

module.exports = class DestroySessionStep extends Step {
  * preResponse(req) {
    yield new Promise(resolve => {
      req.session.regenerate(() => {
        resolve();
      });
    });
  }

  get middleware() {
    // on first hit, init session will pass. on second hit (i.e. refresh)
    // the user will be redirected to index page
    return [initSession, idam.logout()];
  }
};

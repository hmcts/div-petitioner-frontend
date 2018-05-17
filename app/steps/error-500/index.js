const statusCodes = require('http-status-codes');
const Step = require('app/core/steps/Step');

module.exports = class Error500 extends Step {
  get url() {
    return '/errors/500';
  }

  * getRequest(req, res) {
    res.status(statusCodes.INTERNAL_SERVER_ERROR);
    yield super.getRequest(req, res);
  }
};

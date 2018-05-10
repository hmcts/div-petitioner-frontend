const statusCodes = require('http-status-codes');
const Step = require('app/core/steps/Step');

module.exports = class Error400 extends Step {
  get url() {
    return '/errors/400';
  }

  * getRequest(req, res) {
    res.status(statusCodes.BAD_REQUEST);
    yield super.getRequest(req, res);
  }
};

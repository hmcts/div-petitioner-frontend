const statusCodes = require('http-status-codes');
const Step = require('app/core/steps/Step');

module.exports = class Error404 extends Step {
  get url() {
    return '/errors/404';
  }

  * getRequest(req, res) {
    res.status(statusCodes.NOT_FOUND);
    yield super.getRequest(req, res);
  }
};

const statusCodes = require('http-status-codes');
const Step = require('app/core/steps/Step');

module.exports = class GenericError extends Step {
  get url() {
    return '/generic-error';
  }

  * getRequest(req, res) {
    res.status(statusCodes.INTERNAL_SERVER_ERROR);
    yield super.getRequest(req, res);
  }
};
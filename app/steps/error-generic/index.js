const statusCodes = require('http-status-codes');
const Step = require('app/core/steps/Step');

module.exports = class GenericError extends Step {
  get url() {
    return '/generic-error';
  }

  * getRequest(req, res) {
    res.status(statusCodes.NO_CONTENT);
    yield super.getRequest(req, res);
  }
};

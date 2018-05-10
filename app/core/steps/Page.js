const Step = require('app/core/Step');
const locals = require('app/middleware/locals');
const loadContent = require('app/core/middleware/loadContent');

const statusCode = require('app/core/utils/statusCode');

class Page extends Step {
  get middleware() {
    return [locals, loadContent];
  }

  handler(req, res) {
    if (req.method === 'GET') {
      res.render(this.template);
    } else {
      res.sendStatus(statusCode.METHOD_NOT_ALLOWED);
    }
  }

  // eslint-disable-next-line no-warning-comments
  // TODO: Remove this
  // Only runStepHandler cares about #nextStep.
  // Refactor the need for this out.
  //
  // JIRA ticket: DIV-897
  get nextStep() {
    return {};
  }
}

module.exports = Page;

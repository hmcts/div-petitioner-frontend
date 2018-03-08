const Step = require('app/core/Step');
const runStepHandler = require('app/core/handler/runStepHandler');
const initSession = require('app/middleware/initSession');
const { updateApplicationFeeMiddleware } = require('app/middleware/updateApplicationFeeMiddleware');

module.exports = class Index extends Step {
  get url() {
    return '/index';
  }
  get nextStep() {
    return this.steps.ScreeningQuestionsMarriageBroken;
  }

  get middleware() {
    return [initSession, updateApplicationFeeMiddleware];
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  get ignorePa11yWarnings() {
    return [
      // Paragraph with 2 links in it but it's not semantically a list
      'WCAG2AA.Principle1.Guideline1_3.1_3_1.H48'
    ];
  }
};

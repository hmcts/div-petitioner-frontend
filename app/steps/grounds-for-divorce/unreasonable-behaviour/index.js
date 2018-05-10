const ValidationStep = require('app/core/ValidationStep');
const { isEmpty } = require('lodash');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class UnreasonableBehaviour extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/unreasonable-behaviour';
  }

  get nextStep() {
    return this.steps.LegalProceedings;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  interceptor(ctx) {
    if (ctx.reasonForDivorceBehaviourDetails) {
      ctx.reasonForDivorceBehaviourDetails = ctx.reasonForDivorceBehaviourDetails.filter( // eslint-disable-line max-len
        item => {
          return !isEmpty(item) && !item.match(/^(?=My (husband|wife) \.\.\.$)/);
        }
      );
    } else {
      ctx.reasonForDivorceBehaviourDetails = [];
    }

    return ctx;
  }

  constructor(...args) {
    super(...args);

    watch('reasonForDivorce', (previousSession, session, remove) => {
      if (session.reasonForDivorce !== 'unreasonable-behaviour') {
        remove('reasonForDivorceBehaviourDetails');
      }
    });
  }
};

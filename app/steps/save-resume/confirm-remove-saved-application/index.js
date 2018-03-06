const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class DeleteApplication extends OptionStep {
  get url() {
    return '/save-return/delete-application';
  }
  get nextStep() {
    return {
      deleteApplication: {
        Yes: this.steps.ExitRemovedSavedApplication,
        No: this.steps.CheckYourAnswers
      }
    };
  }

  next(ctx, session) {
    const tmpCtx = { deleteApplication: ctx.deleteApplication };

    // do not store the answer to this question
    delete session.deleteApplication;
    delete ctx.deleteApplication;

    return super.next(tmpCtx);
  }

  // disable check your answers
  get checkYourAnswersTemplate() {
    return false;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }
};

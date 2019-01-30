const DestroySessionStep = require('app/core/steps/DestroySessionStep');

module.exports = class SignOut extends DestroySessionStep {
  get url() {
    return '/sign-out';
  }

  get nextStep() {
    return this.steps.Index;
  }

  handler(req, res) {
    Promise.resolve(this.preResponse(req))
      .then(() => {
        res.redirect(this.next().url);
      });
  }
};

const Step = require('app/core/steps/Step');

module.exports = class AvayaWebchat extends Step {
  get url() {
    return '/avaya-webchat';
  }
};

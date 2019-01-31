const Step = require('./Step');

module.exports = class ExitStep extends Step {
  stepType() {
    return 'ExitStep';
  }
};

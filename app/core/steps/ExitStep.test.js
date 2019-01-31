const { expect } = require('test/util/chai');

const modulePath = 'app/core/steps/ExitStep';

const ExitStep = require(modulePath);

const withStep = (StepClass, test) => {
  const step = new StepClass(null, null, null, {});
  return test(step);
};

describe(modulePath, () => {
  withStep(ExitStep, step => {
    it('#stepType returns type of the step', () => {
      expect(step.stepType())
        .to.equal('ExitStep');
    });
  });
});
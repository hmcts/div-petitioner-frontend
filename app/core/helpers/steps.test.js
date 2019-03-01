const { expect, sinon } = require('test/util/chai');
const co = require('co');

const modulePath = 'app/core/helpers/steps';

const steps = require(modulePath);

let testStep = {};
const aValidStep = { name: 'validStep' };

describe(modulePath, () => {
  describe('#getNextValidStep', () => {
    beforeEach(() => {
      testStep = {
        populateWithPreExistingData: sinon.stub().returns({}),
        interceptor: sinon.stub().returns({}),
        validate: sinon.stub(),
        next: sinon.stub().returns(aValidStep)
      };
    });

    it('returns a next step if valid', () => {
      testStep.validate.returns([true]);

      return co(function* generator() {
        const nextStep = yield steps.getNextValidStep(testStep, {});
        expect(nextStep).to.eql(aValidStep);
      });
    });

    it('returns undefined if no step found', () => {
      testStep.validate.returns([false]);

      return co(function* generator() {
        const nextStep = yield steps.getNextValidStep(testStep, {});
        expect(nextStep).to.eql(undefined); // eslint-disable-line no-undefined
      });
    });

    it('returns undefined if error', () => {
      testStep.validate.returns([true]);
      testStep.next = () => {
        throw new Error('Error occoured');
      };

      return co(function* generator() {
        const nextStep = yield steps.getNextValidStep(testStep, {});
        expect(nextStep).to.eql(undefined); // eslint-disable-line no-undefined
      });
    });
  });

  describe('#findNextUnAnsweredStep', () => {
    beforeEach(() => {
      testStep = {
        populateWithPreExistingData: sinon.stub().returns({}),
        interceptor: sinon.stub().returns({}),
        validate: sinon.stub().returns([true]),
        next: sinon.stub()
      };
    });

    it('loops until no next step found', () => {
      const stepShouldBeReturned = { name: 'nextStep' };

      testStep.next.returns(stepShouldBeReturned);

      return co(function* generator() {
        const nextStep = yield steps.findNextUnAnsweredStep(testStep);

        expect(nextStep).to.eql(stepShouldBeReturned);
      });
    });
  });
});

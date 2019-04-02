const { expect, sinon } = require('test/util/chai');
const { cloneDeep } = require('lodash');
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
        throw new Error('Error occurred');
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
        isSkipWhenValid: sinon.stub(),
        next: sinon.stub()
      };
    });

    it('loops until no next step found', () => {
      const stepShouldBeReturned1 = cloneDeep(testStep);
      const stepShouldBeReturned2 = cloneDeep(testStep);

      testStep.next.returns(stepShouldBeReturned1);
      stepShouldBeReturned1.next.returns(stepShouldBeReturned2);
      stepShouldBeReturned2.next.returns(null);
      stepShouldBeReturned1.isSkipWhenValid.returns(true);
      stepShouldBeReturned2.isSkipWhenValid.returns(true);

      return co(function* generator() {
        const nextStep = yield steps.findNextUnAnsweredStep(testStep);

        expect(nextStep).to.eql(stepShouldBeReturned2);
      });
    });

    it('returns next step if it should not be skipped', () => {
      const stepShouldBeReturned1 = cloneDeep(testStep);
      const stepShouldBeReturned2 = cloneDeep(testStep);

      testStep.next.returns(stepShouldBeReturned1);
      stepShouldBeReturned1.next.returns(stepShouldBeReturned2);
      stepShouldBeReturned2.next.returns(null);
      stepShouldBeReturned1.isSkipWhenValid.returns(false);
      stepShouldBeReturned2.isSkipWhenValid.returns(true);

      return co(function* generator() {
        const nextStep = yield steps.findNextUnAnsweredStep(testStep);

        expect(nextStep).to.eql(stepShouldBeReturned1);
      });
    });
  });
});

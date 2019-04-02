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
        name: 'test-step',
        populateWithPreExistingData: sinon.stub().returns({}),
        interceptor: sinon.stub().returns({}),
        validate: sinon.stub().returns([true]),
        isSkippable: true,
        next: sinon.stub()
      };
    });

    it('loops until no next step found', () => {
      const nextStep2 = {
        name: 'test-step2',
        validate: sinon.stub().returns([true]),
        isSkippable: true
      };

      const nextStep1 = {
        name: 'test-step1',
        populateWithPreExistingData: sinon.stub().returns({}),
        interceptor: sinon.stub().returns({}),
        validate: sinon.stub().returns([true]),
        isSkippable: true,
        next: sinon.stub().returns(nextStep2)
      };

      testStep.next.returns(nextStep1);

      return co(function* generator() {
        const nextStep = yield steps.findNextUnAnsweredStep(testStep);

        expect(nextStep).to.eql(nextStep2);
      });
    });

    it('returns next step if it should not be skipped', () => {
      const nextStep2 = {
        name: 'test-step2',
        validate: sinon.stub().returns([true]),
        isSkippable: true
      };

      const nextStep1 = {
        name: 'test-step1',
        validate: sinon.stub().returns([true]),
        isSkippable: false,
        next: sinon.stub().returns(nextStep2)
      };

      testStep.next.returns(nextStep1);

      return co(function* generator() {
        const nextStep = yield steps.findNextUnAnsweredStep(testStep);

        expect(nextStep).to.eql(nextStep1);
      });
    });
  });
});

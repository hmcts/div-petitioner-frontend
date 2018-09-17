/* eslint-disable max-nested-callbacks */
const CONF = require('config');
const { expect, sinon } = require('test/util/chai');
const GovPayStub = require('app/steps/pay/gov-pay-stub');

const modulePath = 'app/steps/pay/gov-pay-stub';

describe(modulePath, () => {
  const currentEnv = CONF.environment;
  const fakeSteps = { CardPaymentStatus: {} };
  class baseStub {
    constructor() {
      this.steps = fakeSteps;
    }
  }

  let underTest = {};
  let previousPrototype = {};

  beforeEach(() => {
    previousPrototype = Object.getPrototypeOf(GovPayStub);
    Object.setPrototypeOf(GovPayStub, baseStub);
    underTest = new GovPayStub();
  });

  afterEach(() => {
    Object.setPrototypeOf(GovPayStub, previousPrototype);
    CONF.environment = currentEnv;
  });

  it('next step is always the card payment query step', () => {
    // Act.
    const output = underTest.nextStep;
    // Assert.
    expect(output).to.equal(fakeSteps.CardPaymentStatus);
  });

  it('has a url getter', () => {
    // Assert.
    expect(underTest.url.length).to.not.equal(0);
  });

  it('does not use the check your answers section', () => {
    // Assert.
    expect(underTest.checkYourAnswersTemplate).to.equal(false);
  });

  it('handler returns 404 in production', () => {
    // Arrange.
    CONF.environment = 'production';
    const res = {
      send: sinon.spy(),
      redirect: sinon.stub()
    };
    res.status = sinon.stub().returns(res);
    underTest.steps = { Error404: { handler: sinon.stub() } };
    // Act.
    underTest.handler({}, res);
    // Assert.
    expect(underTest.steps.Error404.handler.calledOnce).to.equal(true);
  });

  it('does not return 404 in non-production environments', () => {
    // Arrange.
    const req = { method: 'get' };
    const next = sinon.stub();
    const res = {
      send: sinon.spy(),
      redirect: sinon.spy()
    };
    res.status = sinon.stub().returns(res);
    // Act.
    underTest.handler(req, res, next);
    // Assert.
    expect(res.status.called).to.equal(false);
  });
});

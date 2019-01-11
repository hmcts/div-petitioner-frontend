const { expect, sinon } = require('test/util/chai');
const idamMock = require('test/mocks/idam');
const featureToggleConfig = require('test/util/featureToggles');
const idam = require('app/services/idam');

const modulePath = 'app/middleware/idamProtectMiddleware';
const underTest = require(modulePath);

let req = {};
let res = {};
let next = {};
let userDetails = {};
const two = 2;

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    req = {};
    res = {};
    next = sinon.stub();
    userDetails = { email: 'simulate-delivered@notifications.service.gov.uk' };
    const protectStub = sinon.stub().callsArgWith(two, userDetails);
    sinon.stub(idam, 'protect').returns(protectStub);
  });

  afterEach(() => {
    idamMock.restore();
    idam.protect.restore();
  });

  it('with idam disabled it should call next', done => {
    const test = complete => {
      underTest.idamProtect(req, res, next);
      expect(next.calledOnce).to.eql(true);
      expect(next.calledWith()).to.eql(true);
      expect(idam.protect.calledOnce).to.eql(false);
      expect(idam.protect.calledWith()).to.eql(false);
      complete();
    };
    const featureTest = featureToggleConfig.when('idam', false, test);
    featureTest(done);
  });

  it('with idam enabled it should call idam.protect', done => {
    const test = complete => {
      underTest.idamProtect(req, res, next);
      expect(next.calledOnce).to.eql(true);
      expect(next.calledWith()).to.eql(true);
      expect(idam.protect.calledOnce).to.eql(true);
      complete();
    };
    const featureTest = featureToggleConfig.when('idam', true, test);
    featureTest(done);
  });
});

const { expect, sinon } = require('test/util/chai');
const idamMock = require('test/mocks/idam');
const featureTogglesMock = require('test/mocks/featureToggles');
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
    featureTogglesMock.stub();
    req = {};
    res = {};
    next = sinon.stub();
    userDetails = { email: 'email@email.com' };
    const protectStub = sinon.stub().callsArgWith(two, userDetails);
    sinon.stub(idam, 'protect').returns(protectStub);
  });

  afterEach(() => {
    idamMock.restore();
    featureTogglesMock.restore();
    idam.protect.restore();
  });

  it('with idam disabled it should not attempt to get user details from idam', done => {
    const test = complete => {
      underTest.idamProtect(req, res, next);
      expect(next.calledOnce).to.eql(true);
      expect(next.calledWith()).to.eql(true);
      expect(req.hasOwnProperty('idam')).to.eql(false);
      complete();
    };
    const featureMock = featureTogglesMock.when('idam', false, test);
    featureMock(done);
  });

  it('with idam enabled it should save the idam userdetails to the req object', done => {
    const test = complete => {
      underTest.idamProtect(req, res, next);
      expect(next.calledOnce).to.eql(true);
      expect(next.calledWith()).to.eql(true);
      expect(req.hasOwnProperty('idam')).to.eql(true);
      expect(req.idam).to.eql({ userDetails });
      complete();
    };
    const featureMock = featureTogglesMock.when('idam', true, test);
    featureMock(done);
  });
});

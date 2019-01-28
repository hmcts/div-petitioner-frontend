const { expect, sinon } = require('test/util/chai');
const idam = require('app/services/idam');
const initSession = require('app/middleware/initSession');
const co = require('co');
const featureToggleConfig = require('test/util/featureToggles');

const modulePath = 'app/core/steps/DestroySessionStep';
const UnderTest = require(modulePath);

const step = new UnderTest();

describe(modulePath, () => {
  it('returns middleware to logout from idam when idam feature is true', done => {
    const test = complete => {
      sinon.stub(idam, 'logout').returns('idamLogout');
      expect(step.middleware[0]).to.eql(initSession);
      expect(step.middleware[1]).to.eql(idam.logout());
      idam.logout.restore();
      complete();
    };

    const featureTest = featureToggleConfig.when('idam', true, test);
    featureTest(done);
  });

  it('returns middleware to logout when idam feature is false', done => {
    const test = complete => {
      sinon.stub(idam, 'logout').returns('idamLogout');
      expect(step.middleware[0]).to.eql(initSession);
      expect(step.middleware[1]).to.not.eql(idam.logout());
      idam.logout.restore();
      complete();
    };

    const featureTest = featureToggleConfig.when('idam', false, test);
    featureTest(done);
  });

  describe('#preResponse', () => {
    let req = null;
    beforeEach(done => {
      req = { session: { regenerate: sinon.stub().callsArg(0) } };
      co(function* generator() {
        yield step.preResponse(req);
      }).then(done, done);
    });

    it('destroys the session', () => {
      expect(req.session.regenerate.calledOnce).to.eql(true);
    });
  });
});

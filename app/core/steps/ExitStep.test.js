const { expect, sinon } = require('test/util/chai');
const idam = require('app/services/idam');
const initSession = require('app/middleware/initSession');
const co = require('co');
const featureToggleConfig = require('test/util/featureToggles');
const { getWebchatOpeningHours } = require('app/middleware/getWebchatOpenHours');

const modulePath = 'app/core/steps/ExitStep';
const UnderTest = require(modulePath);

describe(modulePath, () => {
  context('default constructor', () => {
    const step = new UnderTest();

    it('returns middleware to logout from idam when idam feature is true', done => {
      const test = complete => {
        sinon.stub(idam, 'logout').returns('idamLogout');
        expect(step.middleware[0]).to.eql(getWebchatOpeningHours);
        expect(step.middleware[1]).to.eql(initSession);
        expect(step.middleware[2]).to.eql(idam.logout());
        idam.logout.restore();
        complete();
      };

      const featureTest = featureToggleConfig.when('idam', true, test);
      featureTest(done);
    });

    it('returns middleware to logout when idam feature is false', done => {
      const test = complete => {
        sinon.stub(idam, 'logout').returns('idamLogout');
        expect(step.middleware[0]).to.eql(getWebchatOpeningHours);
        expect(step.middleware[1]).to.eql(initSession);
        expect(step.middleware[2]).to.not.eql(idam.logout());
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

  context('constructor logout is false', () => {
    const step = new UnderTest(null, null, null, null, { logout: false });

    it('returns only getWebchatOpeningHours middleware', done => {
      expect(step.middleware).to.eql([getWebchatOpeningHours]);
      done();
    });

    describe('#preResponse', () => {
      const req = { session: { regenerate: sinon.stub().callsArg(0) } };

      it('does not destroy the session', done => {
        co(function* generator() {
          yield step.preResponse(req);
          expect(req.session.regenerate.calledOnce).to.eql(false);
        }).then(done, done);
      });
    });
  });
});

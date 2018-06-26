const { expect, sinon } = require('test/util/chai');
const idam = require('app/services/idam');
const initSession = require('app/middleware/initSession');
const co = require('co');

const modulePath = 'app/core/steps/DestroySessionStep';
const UnderTest = require(modulePath);

const step = new UnderTest();

describe(modulePath, () => {
  it('returns middleware to logout from idam', () => {
    sinon.stub(idam, 'logout').returns('idamLogout');
    expect(step.middleware[0]).to.eql(initSession);
    expect(step.middleware[1]).to.eql(idam.logout());
    idam.logout.restore();
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

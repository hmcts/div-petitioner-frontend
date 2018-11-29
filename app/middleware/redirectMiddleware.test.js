const { expect, sinon } = require('test/util/chai');
const featureToggleConfig = require('test/util/featureToggles');
const CONF = require('config');

const modulePath = 'app/middleware/redirectMiddleware';

const redirectMiddleware = require(modulePath);

const authTokenString = '__auth-token';
const dnFrontend = CONF.apps.dn;
const queryString = `?${authTokenString}=authToken`;
const expectedUrl = `${dnFrontend.url}${dnFrontend.landing}${queryString}`;

describe(modulePath, () => {
  let req = {}, res = {}, next = {};

  beforeEach(() => {
    req = {
      session: { courts: 'serviceCentre' },
      cookies: { '__auth-token': 'authToken' }
    };
    res = {
      redirect: sinon.stub(),
      set: sinon.stub()
    };
    next = sinon.stub();
  });

  context('feature is enabled', () => {
    it('should call next when there is no state', done => {
      const test = cleanup => {
        redirectMiddleware.redirectOnCondition(req, res, next);

        expect(next.calledOnce).to.eql(true);
        cleanup();
      };

      const featureTest = featureToggleConfig.when('redirectOnState', true, test);
      featureTest(done);
    });

    it('should call next wen there is no session', done => {
      const test = cleanup => {
        delete req.session;

        redirectMiddleware.redirectOnCondition(req, res, next);

        expect(next.calledOnce).to.eql(true);
        cleanup();
      };

      const featureTest = featureToggleConfig.when('redirectOnState', true, test);
      featureTest(done);
    });

    it('should call next when the state is AwaitingPayment', done => {
      const test = cleanup => {
        req.session.state = 'AwaitingPayment';

        redirectMiddleware.redirectOnCondition(req, res, next);

        expect(next.calledOnce).to.eql(true);
        cleanup();
      };

      const featureTest = featureToggleConfig.when('redirectOnState', true, test);
      featureTest(done);
    });

    it('should call redirect to DN if the state is not AwaitingPayment', done => {
      const test = cleanup => {
        req.session.state = 'AwaitingDecreeNisi';

        redirectMiddleware.redirectOnCondition(req, res, next);

        expect(next.calledOnce).to.eql(false);
        expect(res.redirect.calledWith(expectedUrl)).to.eql(true);
        cleanup();
      };

      const featureTest = featureToggleConfig.when('redirectOnState', true, test);
      featureTest(done);
    });

    it('should call next when court is not CTSC', done => {
      const test = cleanup => {
        req.session.courts = 'eastMidlands';
        req.session.state = 'AwaitingDecreeNisi';

        redirectMiddleware.redirectOnCondition(req, res, next);

        expect(next.calledOnce).to.eql(true);
        cleanup();
      };

      const featureTest = featureToggleConfig.when('redirectOnState', true, test);
      featureTest(done);
    });
  });

  context('feature is disabled', () => {
    it('should call next when feature is disabled', done => {
      const test = cleanup => {
        req.session.state = 'AwaitingDecreeNisi';

        redirectMiddleware.redirectOnCondition(req, res, next);

        expect(next.calledOnce).to.eql(true);
        cleanup();
      };

      const featureTest = featureToggleConfig.when('redirectOnState', false, test);
      featureTest(done);
    });
  });
});

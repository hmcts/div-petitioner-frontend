const { expect, sinon } = require('test/util/chai');
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
    it('should call next when there is no state', () => {
      redirectMiddleware.redirectOnCondition(req, res, next);

      expect(next.calledOnce).to.eql(true);
    });

    it('should call next wen there is no session', () => {
      delete req.session;

      redirectMiddleware.redirectOnCondition(req, res, next);

      expect(next.calledOnce).to.eql(true);
    });

    it('should call next when the state is AwaitingPayment', () => {
      req.session.state = 'AwaitingPayment';

      redirectMiddleware.redirectOnCondition(req, res, next);

      expect(next.calledOnce).to.eql(true);
    });

    it('should call redirect to DN if the state is not AwaitingPayment', () => {
      req.session.state = 'AwaitingDecreeNisi';

      redirectMiddleware.redirectOnCondition(req, res, next);

      expect(next.calledOnce).to.eql(false);
      expect(res.redirect.calledWith(expectedUrl)).to.eql(true);
    });

    it('should call next when court is not CTSC', () => {
      req.session.courts = 'eastMidlands';
      req.session.state = 'AwaitingDecreeNisi';

      redirectMiddleware.redirectOnCondition(req, res, next);

      expect(next.calledOnce).to.eql(true);
    });
  });
});

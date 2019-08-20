const { expect, sinon } = require('test/util/chai');
const CONF = require('config');
const serviceCentreCourt = require('test/examples/courts/serviceCentre');

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
      session: { allocatedCourt: serviceCentreCourt },
      cookies: { '__auth-token': 'authToken' }
    };
    res = {
      redirect: sinon.stub(),
      set: sinon.stub()
    };
    next = sinon.stub();
  });

  context('generic tests', () => {
    it('should call next when there is no session', () => {
      delete req.session;

      redirectMiddleware.redirectOnCondition(req, res, next);

      expect(next.calledOnce).to.eql(true);
    });

    it('should call next when there is no state', () => {
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
  });

  context('court information', () => {
    context('session comes from draft store or redis (old format)', () => {
      beforeEach(() => {
        delete req.session.allocatedCourt;
      });

      it('should call redirect to DN when court is CTSC', () => {
        req.session.courts = 'serviceCentre';
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
        expect(res.redirect.called).to.eql(false);
      });
    });
  });

  context('session is formed in PFE (in the new format)', () => {
    it('should call redirect to DN when court is CTSC', () => {
      req.session.state = 'AwaitingDecreeNisi';

      redirectMiddleware.redirectOnCondition(req, res, next);

      expect(next.calledOnce).to.eql(false);
      expect(res.redirect.calledWith(expectedUrl)).to.eql(true);
    });

    it('should call next when court is not CTSC', () => {
      req.session.allocatedCourt = { courtId: 'eastMidlands' };
      req.session.state = 'AwaitingDecreeNisi';

      redirectMiddleware.redirectOnCondition(req, res, next);

      expect(next.calledOnce).to.eql(true);
      expect(res.redirect.called).to.eql(false);
    });
  });
});

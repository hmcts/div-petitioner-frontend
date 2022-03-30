const { expect, sinon } = require('test/util/chai');
const CONF = require('config');
const serviceCentreCourt = require('test/examples/courts/serviceCentre');

const modulePath = 'app/middleware/redirectMiddleware';

const forEach = require('mocha-each');

const redirectMiddleware = require(modulePath);

const authTokenString = '__auth-token';
const dnFrontend = CONF.apps.dn;
const queryString = `?${authTokenString}=authToken`;
const expectedUrl = `${dnFrontend.url}${dnFrontend.landing}${queryString}`;

// Landing page config
const today = new Date();
const cutoffDate = new Date(CONF.newAppCutoffDate);
const cutoff = JSON.parse(CONF.newAppCutoffDateOverride) ? true : today >= cutoffDate;
const landingPageUrl = '/cutoff-landing-page';

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
    if (cutoff && JSON.parse(CONF.features.newAppCutoff)) {
      it('should redirect to landing page when there is no session', () => {
        delete req.session;

        redirectMiddleware.redirectOnCondition(req, res, next);

        expect(next.calledOnce).to.eql(false);
        expect(res.redirect.calledWith(landingPageUrl)).to.eql(true);
      });

      it('should redirect to landing page when there is no state', () => {
        delete req.session.state;

        redirectMiddleware.redirectOnCondition(req, res, next);

        expect(next.calledOnce).to.eql(false);
        expect(res.redirect.calledWith(landingPageUrl)).to.eql(true);
      });

      it('should redirect to landing page when there is no caseId', () => {
        delete req.session.caseId;

        redirectMiddleware.redirectOnCondition(req, res, next);

        expect(next.calledOnce).to.eql(false);
        expect(res.redirect.calledWith(landingPageUrl)).to.eql(true);
      });

      forEach(CONF.newAppCutoffRedirectStates)
        .it('should redirect to landing page when a caseId exists and the state is %s', caseState => {
          req.session.state = caseState;
          req.session.caseId = 'TestCaseId';
          // Remove the allocatedCourt to handle any missing overlap with CONF.ccd.d8States
          delete req.session.allocatedCourt;

          redirectMiddleware.redirectOnCondition(req, res, next);

          expect(next.calledOnce).to.eql(false);
          expect(res.redirect.calledWith(landingPageUrl)).to.eql(true);
        });
    } else {
      it('should call next when there is no session', () => {
        delete req.session;

        redirectMiddleware.redirectOnCondition(req, res, next);

        expect(next.calledOnce)
          .to
          .eql(true);
      });

      it('should call next when there is no state', () => {
        redirectMiddleware.redirectOnCondition(req, res, next);

        expect(next.calledOnce)
          .to
          .eql(true);
      });

      it('should call next when the state is AwaitingPayment', () => {
        req.session.state = 'AwaitingPayment';

        redirectMiddleware.redirectOnCondition(req, res, next);

        expect(next.calledOnce)
          .to
          .eql(true);
      });
    }

    forEach([
      ['IssuedToBailiff'],
      ['AwaitingBailiffService']
    ])
      .it('should call next when a caseId exists and the state is %s', caseState => {
        req.session.caseId = 'TestCaseId';
        req.session.state = caseState;

        redirectMiddleware.redirectOnCondition(req, res, next);

        expect(next.calledOnce)
          .to
          .eql(true);
      });

    it('should call next when a caseId exists and the state is AwaitingAmendCase', () => {
      req.session.caseId = 'TestCaseId';
      req.session.state = 'AwaitingAmendCase';

      redirectMiddleware.redirectOnCondition(req, res, next);

      expect(next.calledOnce)
        .to
        .eql(true);
    });

    it('should call redirect to DN if a caseId exists and the state is AwaitingDecreeNisi', () => {
      req.session.caseId = 'TestCaseId';
      req.session.state = 'AwaitingDecreeNisi';

      redirectMiddleware.redirectOnCondition(req, res, next);

      expect(next.calledOnce).to.eql(false);
      expect(res.redirect.calledWith(expectedUrl)).to.eql(true);
    });

    describe('Redirections to DN app', () => {
      const stateToRedirectToDn = ['AwaitingGeneralReferralPayment', 'GeneralConsiderationComplete'];

      stateToRedirectToDn.forEach(currentState => {
        // eslint-disable-next-line max-nested-callbacks
        it(`should redirect to DN when state is ${currentState}`, () => {
          req.session.state = currentState;

          redirectMiddleware.redirectOnCondition(req, res, next);

          expect(next.calledOnce).to.eql(false);
          expect(res.redirect.calledWith(expectedUrl)).to.eql(true);
        });
      });
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
        req.session.caseId = 'TestCaseId';

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
      req.session.caseId = 'TestCaseId';

      redirectMiddleware.redirectOnCondition(req, res, next);

      expect(next.calledOnce).to.eql(true);
      expect(res.redirect.called).to.eql(false);
    });
  });
});

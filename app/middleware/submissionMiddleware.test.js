const { expect, sinon } = require('test/util/chai');
const config = require('config');

const modulePath = 'app/middleware/submissionMiddleware';
const underTest = require(modulePath);

let req = {};
let res = {};
let next = {};
let ctx = {};

const currentDeploymentEnv = config.deployment_env;

describe(modulePath, () => {
  describe('#hasSubmitted', () => {
    beforeEach(() => {
      ctx = { };
      req = { session: {} };
      res = { redirect: sinon.stub() };
      next = sinon.stub();
    });
    afterEach(() => {
      config.deployment_env = currentDeploymentEnv;
    });
    it('redirects to /application-submitted if application has been submitted and is in "AwaitingPayment"', () => {
      req.session.caseId = 'someid';
      req.session.state = 'AwaitingPayment';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.calledOnce).to.eql(true);
      expect(res.redirect.calledWith('/application-submitted')).to.eql(true);
    });
    it('redirects to /application-submitted-awaiting-response if application has been submitted and is in "AwaitingDocuments" state', () => {
      req.session.caseId = 'someid';
      req.session.state = 'AwaitingDocuments';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.calledOnce).to.eql(true);
      expect(res.redirect.calledWith('/application-submitted-awaiting-response')).to.eql(true);
    });
    it('redirects to /application-submitted-awaiting-response if application has been submitted and is in "AwaitingHWFDecision" state', () => {
      req.session.caseId = 'someid';
      req.session.state = 'AwaitingHWFDecision';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.calledOnce).to.eql(true);
      expect(res.redirect.calledWith('/application-submitted-awaiting-response')).to.eql(true);
    });
    it('redirects to /application-submitted-awaiting-response if application has been submitted and is in "Issued" state', () => {
      req.session.caseId = 'someid';
      req.session.state = 'Issued';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.calledOnce).to.eql(true);
      expect(res.redirect.calledWith('/application-submitted-awaiting-response')).to.eql(true);
    });
    it('redirects to /application-submitted-awaiting-response if application has been submitted and is in "PendingRejection" state', () => {
      req.session.caseId = 'someid';
      req.session.state = 'PendingRejection';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.calledOnce).to.eql(true);
      expect(res.redirect.calledWith('/application-submitted-awaiting-response')).to.eql(true);
    });
    it('redirects to /application-submitted-awaiting-response if application has been submitted and is in "Submitted" state', () => {
      req.session.caseId = 'someid';
      req.session.state = 'Submitted';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.calledOnce).to.eql(true);
      expect(res.redirect.calledWith('/application-submitted-awaiting-response')).to.eql(true);
    });
    it('calls next if application has been submitted and is "Rejected"', () => {
      req.session.caseId = 'someid';
      req.session.state = 'Rejected';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.called).to.eql(false);
      expect(next.calledOnce).to.eql(true);
    });
    it('redirects to /next if application has been submitted and is in a random state', () => {
      req.session.caseId = 'someid';
      req.session.state = 'randomState';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.called).to.eql(false);
      expect(next.calledOnce).to.eql(true);
    });
    it('calls next if application has not been submitted', () => {
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.called).to.eql(false);
      expect(next.calledOnce).to.eql(true);
    });
    it('calls next if step has property enabledAfterSubmission', () => {
      ctx.enabledAfterSubmission = true;
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.called).to.eql(false);
      expect(next.calledOnce).to.eql(true);
    });
  });
});

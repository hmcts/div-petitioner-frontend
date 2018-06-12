const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/middleware/submissionMiddleware';
const underTest = require(modulePath);

let req = {};
let res = {};
let next = {};
let ctx = {};

describe(modulePath, () => {
  describe('#hasSubmitted', () => {
    beforeEach(() => {
      ctx = { };
      req = { session: {} };
      res = { redirect: sinon.stub() };
      next = sinon.stub();
    });
    it('redirects to /application-submitted if application has been submitted', () => {
      req.session.caseId = 'someid';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.calledOnce).to.eql(true);
      expect(res.redirect.calledWith('/application-submitted')).to.eql(true);
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

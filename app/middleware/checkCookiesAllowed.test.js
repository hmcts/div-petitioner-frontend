const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/middleware/checkCookiesAllowed';
const underTest = require(modulePath);

let req = {};
let res = {};
let next = {};

const queryStringParameter = 'attemptToSetTestCookie';

describe(modulePath, () => {
  beforeEach(() => {
    req = {
      session: {},
      originalUrl: '/page',
      cookies: {},
      baseUrl: '/originatingPage',
      query: {}
    };

    res = {
      redirect: sinon.stub(),
      cookie: sinon.stub(),
      clearCookie: sinon.stub()
    };

    next = sinon.stub();
  });

  describe('cookies allowed and exist', () => {
    beforeEach(() => {
      req.cookies.someOtherCookie = 'someOtherCookieValue';
      underTest(req, res, next);
    });

    it('should call next', () => {
      expect(next.callCount).to.equal(1);
      expect(res.clearCookie.calledWith('test')).to.equal(true);
    });

    it('should not redirect to error page', () => {
      expect(res.redirect.calledWith('/cookie-error')).to.not.equal(true);
    });
  });

  describe('cookies missing', () => {
    beforeEach(() => {
      req.cookies = {};
      underTest(req, res, next);
    });

    it('should not call next', () => {
      expect(next.callCount).to.equal(0);
    });

    it('should set test cookie and redirect to the same page with querystring parameter', () => {
      expect(res.cookie.calledWith('test', 'testCookie')).to.equal(true);
      expect(res.redirect.calledWith(`/originatingPage?${queryStringParameter}=true`)).to.equal(true);
    });
  });

  describe('cookies missing and test cookie could not be set', () => {
    beforeEach(() => {
      req.cookies = {};
      req.query[queryStringParameter] = true;
      underTest(req, res, next);
    });

    it('should not call next', () => {
      expect(next.callCount).to.equal(0);
    });

    it('should redirect to error page', () => {
      expect(res.redirect.calledWith('/cookie-error')).to.equal(true);
    });
  });
});
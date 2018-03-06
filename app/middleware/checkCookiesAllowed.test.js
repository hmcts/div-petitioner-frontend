const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/middleware/checkCookiesAllowed';
const underTest = require(modulePath);

let req = {};
let res = {};
let next = {};

describe(modulePath, () => {
  beforeEach(() => {
    req = {
      session: {},
      originalUrl: '/page',
      cookies: {}
    };

    res = { redirect: sinon.stub() };

    next = sinon.stub();
  });

  describe('cookies allowed and exist', () => {
    beforeEach(() => {
      req.cookies['connect.sid'] = 'exists';

      underTest(req, res, next);
    });

    it('should call next', () => {
      expect(next.callCount).to.equal(1);
    });

    it('should not redirect', () => {
      expect(res.redirect.calledWith('/cookie-error')).to.not.equal(true);
    });
  });

  describe('cookies missing', () => {
    beforeEach(() => {
      underTest(req, res, next);
    });

    it('should not call next', () => {
      expect(next.callCount).to.equal(0);
    });

    it('should redirect', () => {
      expect(res.redirect.calledWith('/cookie-error')).to.equal(true);
    });
  });
});

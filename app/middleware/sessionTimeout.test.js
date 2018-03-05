const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/middleware/sessionTimeout';
const underTest = require(modulePath);


let req = {};
let res = {};
let next = {};
let time = {};

const ONE_SECOND = 1000;
const HALF_SECOND = 500;

describe(modulePath, () => {
  beforeEach(() => {
    req = {
      session: { expires: Date.now() - ONE_SECOND },
      originalUrl: '/page'
    };

    res = { redirect: sinon.stub() };

    next = sinon.stub();
  });

  describe('success', () => {
    describe('an expired session', () => {
      beforeEach(() => {
        time = req.session.expires;

        underTest(req, res, next);
      });

      it('ignores the expires property', () => {
        expect(req.session.expires).to.equal(time);
      });

      it('redirects to the timeout page', () => {
        expect(res.redirect.calledWith('/timeout')).to.equal(true);
      });

      it('does not call next()', () => {
        expect(next.callCount).to.equal(0);
      });
    });

    describe('an active session', () => {
      beforeEach(() => {
        time = Date.now() + HALF_SECOND;

        req.session.expires = time;

        underTest(req, res, next);
      });

      it('resets the expires property', () => {
        expect(req.session.expires).to.be.greaterThan(time);
      });

      it('does not redirect', () => {
        expect(res.redirect.callCount).to.equal(0);
      });

      it('calls next()', () => {
        expect(next.callCount).to.equal(1);
      });
    });

    describe('if the page is already timeout', () => {
      beforeEach(() => {
        req.originalUrl = '/timeout';

        time = req.session.expires;

        underTest(req, res, next);
      });

      it('ignores the expires property', () => {
        expect(req.session.expires).to.equal(time);
      });

      it('does not redirect', () => {
        expect(res.redirect.callCount).to.equal(0);
      });

      it('calls next()', () => {
        expect(next.callCount).to.equal(1);
      });
    });
  });
});

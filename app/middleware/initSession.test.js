const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/middleware/initSession';
const underTest = require(modulePath);

let req = {};
let res = {};
let next = {};
let time = {};

describe(modulePath, () => {
  beforeEach(() => {
    req = {
      session: {},
      originalUrl: '/page'
    };

    res = {
      redirect: sinon.stub(),
      cookie: sinon.stub(),
      status: sinon.stub()
    };

    next = sinon.stub();
  });

  describe('success', () => {
    describe('initialising a new session on any page that is not the index', () => {
      beforeEach(() => {
        underTest(req, res, next);
      });

      it('set an expires property on the session', () => {
        expect(typeof req.session.expires).to.equal('number');
      });

      it('redirects to the index page', () => {
        expect(res.redirect.calledWith('/')).to.equal(true);
      });

      it('does not call next()', () => {
        expect(next.callCount).to.equal(0);
      });
    });

    describe('initialising a new session on the index page', () => {
      beforeEach(() => {
        req.originalUrl = '/index';

        underTest(req, res, next);
      });

      it('set an expires property on the session', () => {
        expect(typeof req.session.expires).to.equal('number');
      });

      it('does not redirect to the index page', () => {
        expect(res.redirect.calledWith('/')).not.equal(true);
      });

      it('does call next()', () => {
        expect(next.callCount).to.equal(1);
      });
    });

    describe('an already initialised session', () => {
      beforeEach(() => {
        time = new Date(Date.now()).getTime();

        req.session.expires = time;

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

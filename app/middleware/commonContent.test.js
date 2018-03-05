const { expect } = require('test/util/chai');
const commonContent = require('app/middleware/commonContent');

const test = block => {
  return done => {
    const req = {};
    const res = { locals: {} };
    const next = () => {
      block(req, res);
      done();
    };
    commonContent(req, res, next);
  };
};

describe('commonContent middleware', () => {
  describe('locals#i18n / req#i18n', () => {
    it('exposes i18n by attaching it to the req', test((req, res) => {
      expect(res.locals.i18n).to.be.an('object');
      expect(req.i18n).to.be.an('object');
    }));
  });
  describe('locals#common', () => {
    it('contains the common content', test((req, res) => {
      expect(res.locals.common.phase).to.eq('Beta');
    }));
  });
});

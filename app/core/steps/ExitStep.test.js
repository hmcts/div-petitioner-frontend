const requireDir = require('require-directory');
const { expect } = require('test/util/chai');
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');

const modulePath = 'app/core/steps/ExitStep';
const UnderTest = require(modulePath);

const fixtures = requireDir(module, `${__dirname}/../fixtures`);

let underTest = {};

describe(modulePath, () => {
  describe('#middleware', () => {
    it('returns middleware for exit step', () => {
      underTest = new UnderTest({}, 'screening-questions', null, fixtures.content.simple, fixtures.schemas.simple);
      const middleware = [
        idamProtect,
        initSession,
        sessionTimeout
      ];
      expect(underTest.middleware).to.eql(middleware);
    });
  });
});

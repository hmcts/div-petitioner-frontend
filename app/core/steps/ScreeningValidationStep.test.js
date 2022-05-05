const requireDir = require('require-directory');
const { expect } = require('test/util/chai');
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const { redirectOnCondition } = require('app/middleware/redirectMiddleware');
const { hasSubmitted } = require('app/middleware/submissionMiddleware');
const { restoreFromDraftStore } = require('app/middleware/draftPetitionStoreMiddleware');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');
const { setIdamUserDetails } = require('app/middleware/setIdamDetailsToSessionMiddleware');
const { getWebchatOpeningHours } = require('app/middleware/getWebchatOpenHours');

const modulePath = 'app/core/steps/ScreeningValidationStep';
const UnderTest = require(modulePath);

const fixtures = requireDir(module, `${__dirname}/../fixtures`);

let underTest = {};

describe(modulePath, () => {
  describe('#middleware', () => {
    it('returns middleware for screening validation step', () => {
      underTest = new UnderTest({}, 'screening-questions', null, fixtures.content.simple, fixtures.schemas.simple);
      const middleware = [
        idamProtect,
        initSession,
        sessionTimeout,
        getWebchatOpeningHours,
        redirectOnCondition,
        restoreFromDraftStore,
        setIdamUserDetails,
        hasSubmitted
      ];
      expect(underTest.middleware).to.eql(middleware);
    });
  });

  describe('#postMiddleware', () => {
    it('returns postMiddleware for validation step', () => {
      underTest = new UnderTest({}, 'screening-questions', null, fixtures.content.simple, fixtures.schemas.simple);
      const middleware = [];
      expect(underTest.postMiddleware).to.eql(middleware);
    });
  });
});

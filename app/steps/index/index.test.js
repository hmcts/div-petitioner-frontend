const request = require('supertest');
const { testContent, testRedirect, testNonExistence } = require('test/util/assertions');
const server = require('app');

const modulePath = 'app/steps/index';
const content = require(`${modulePath}/content`);

const contentStrings = content.resources.en.translation.content;
const featureTogglesMock = require('test/mocks/featureToggles');
const { withSession } = require('test/util/setup');

const { features } = require('@hmcts/div-feature-toggle-client')().featureToggles;

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    featureTogglesMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.Index;
  });


  afterEach(() => {
    s.http.close();
    featureTogglesMock.restore();
  });

  describe('success', () => {
    beforeEach(done => {
      withSession(done, agent);
    });

    it('renders the content from the content file for foreignMarriageCerts toggle enabled', done => {
      const excludeKeys = ['marriedInEngland'];

      if (features.onlineSubmission) {
        excludeKeys.push(
          'needToSend',
          'fillInOnline',
          'thisService',
          'onlySave',
          'checkIf',
          'youCanUse',
          'havePrinter',
          'alsoApply',
          'youCan',
          'creditCard',
          'cheque'
        );
      } else {
        excludeKeys.push(
          'checkIfApplyOnline',
          'youCanUseApplyOnline',
          'needToSendApplyOnline',
          'alsoApplyApplyOnline',
          'chequeOnline',
          'needToPayOnline'
        );
      }

      const featureMock = featureTogglesMock.when('foreignMarriageCerts', true, testContent, agent, underTest, content, {}, excludeKeys);

      featureMock(done);
    });

    it('does not render marriedInEngland from the content file for foreignMarriageCerts toggle enabled', done => {
      const featureMock = featureTogglesMock.when('foreignMarriageCerts', true, testNonExistence, agent, underTest, contentStrings.marriedInEngland, {});

      featureMock(done);
    });

    it('renders the content from the content file for foreignMarriageCerts toggle disabled', done => {
      const excludeKeys = ['englishTranslation'];

      if (features.onlineSubmission) {
        excludeKeys.push(
          'needToSend',
          'fillInOnline',
          'thisService',
          'onlySave',
          'checkIf',
          'youCanUse',
          'havePrinter',
          'alsoApply',
          'youCan',
          'creditCard',
          'cheque'
        );
      } else {
        excludeKeys.push(
          'checkIfApplyOnline',
          'youCanUseApplyOnline',
          'needToSendApplyOnline',
          'alsoApplyApplyOnline',
          'chequeOnline',
          'needToPayOnline'
        );
      }

      const featureMock = featureTogglesMock.when('foreignMarriageCerts', false, testContent, agent, underTest, content, {}, excludeKeys);

      featureMock(done);
    });

    it('does not render englishTranslation from the content file for foreignMarriageCerts toggle disabled', done => {
      const featureMock = featureTogglesMock.when('foreignMarriageCerts', false, testNonExistence, agent, underTest, contentStrings.englishTranslation, {});

      featureMock(done);
    });

    it('redirects to the next page', done => {
      testRedirect(done, agent, underTest, {},
        s.steps.ScreeningQuestionsMarriageBroken);
    });
  });
});

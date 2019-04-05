const request = require('supertest');
const { testContent, testErrors, testRedirect, testNonExistence } = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/screening-questions/has-marriage-cert';
const content = require(`${modulePath}/content`);
const commonContent = require('app/content/common');
const featureToggleConfig = require('test/util/featureToggles');

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.ScreeningQuestionsMarriageCertificate;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });

    it('redirects to NeedHelpWithFees page when showSystemMessage feature is false', done => {
      const context = { screenHasMarriageCert: 'Yes' };

      const featureTest = featureToggleConfig
        .when('showSystemMessage', false, testRedirect, agent, underTest, context, s.steps.NeedHelpWithFees);

      featureTest(done);
    });

    it('redirects to SystemMessage page when showSystemMessage feature is true', done => {
      const context = { screenHasMarriageCert: 'Yes' };

      const featureTest = featureToggleConfig
        .when('showSystemMessage', true, testRedirect, agent, underTest, context, s.steps.SystemMessage);

      featureTest(done);
    });

    it('redirects to the exit page', done => {
      const context = { screenHasMarriageCert: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.ExitMarriageCertificate);
    });

    it('does not render save and close button', done => {
      testNonExistence(done, agent, underTest,
        commonContent.resources.en.translation.saveAndClose);
    });
  });
});

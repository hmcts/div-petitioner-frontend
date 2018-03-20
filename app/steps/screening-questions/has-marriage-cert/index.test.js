const request = require('supertest');
const { testContent, testErrors, testRedirect } = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');
const featureTogglesMock = require('test/mocks/featureToggles');

const modulePath = 'app/steps/screening-questions/has-marriage-cert';
const content = require(`${modulePath}/content`);
const { withSession } = require('test/util/setup');

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    featureTogglesMock.stub();
    agent = request.agent(s.app);
    underTest = s.steps.ScreeningQuestionsMarriageCertificate;
  });


  afterEach(() => {
    s.http.close();
    idamMock.restore();
    featureTogglesMock.restore();
  });


  describe('success', () => {
    it('renders the content from the content file', done => {
      withSession(() => {}, agent); // eslint-disable-line no-empty-function

      testContent(done, agent, underTest, content);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });

    it('redirects to the next page for onlineSubmission enabled', done => {
      const nextStep = s.steps.NeedHelpWithFees;
      const context = { screenHasMarriageCert: 'Yes' };

      const featureMock = featureTogglesMock.when('onlineSubmission', true, testRedirect, agent, underTest, context, nextStep);

      featureMock(done);
    });

    it('redirects to the next page for onlineSubmission disabled', done => {
      const nextStep = s.steps.ScreeningQuestionsPrinter;
      const context = { screenHasMarriageCert: 'Yes' };

      const featureMock = featureTogglesMock.when('onlineSubmission', false, testRedirect, agent, underTest, context, nextStep);

      featureMock(done);
    });

    it('redirects to the exit page', done => {
      const context = { screenHasMarriageCert: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.ExitMarriageCertificate);
    });
  });
});

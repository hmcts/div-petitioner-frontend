const request = require('supertest');
const { testContent, testRedirect, testNonExistence } = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/screening-questions/financial-remedy';
const content = require(`${modulePath}/content`);
const commonContent = require('app/content/common');

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.ScreeningQuestionsFinancialRemedy;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });

    it('redirects to the next page', done => {
      const nextStep = s.steps.NeedHelpWithFees;
      const context = { };
      testRedirect(done, agent, underTest, context, nextStep);
    });

    it('does not render save and close button', done => {
      testNonExistence(done, agent, underTest,
        commonContent.resources.en.translation.saveAndClose);
    });
  });
});

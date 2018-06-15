const request = require('supertest');
const { testContent, testErrors, testRedirect } = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/screening-questions/has-respondent-address';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.ScreeningQuestionsRespondentAddress;
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

    it('redirects to the next page', done => {
      const context = { screenHasRespondentAddress: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.ScreeningQuestionsMarriageCertificate);
    });

    it('redirects to the exit page', done => {
      const context = { screenHasRespondentAddress: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.ExitRespondentAddress);
    });
  });
});

const request = require('supertest');
const { testContent, testErrors, testRedirect } = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');

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
    agent = request.agent(s.app);
    underTest = s.steps.ScreeningQuestionsMarriageCertificate;
  });


  afterEach(() => {
    s.http.close();
    idamMock.restore();
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

    it('redirects to the next page', done => {
      const nextStep = s.steps.NeedHelpWithFees;
      const context = { screenHasMarriageCert: 'Yes' };
      testRedirect(done, agent, underTest, context, nextStep);
    });

    it('redirects to the exit page', done => {
      const context = { screenHasMarriageCert: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.ExitMarriageCertificate);
    });
  });
});

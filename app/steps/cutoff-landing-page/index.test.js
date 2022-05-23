const request = require('supertest');
const { testContent } = require('test/util/assertions');
const { expect } = require('test/util/chai');
const server = require('app');

const modulePath = 'app/steps/cutoff-landing-page';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.CutOffLandingPage;
  });

  describe('success', () => {
    const session = {};

    it('should immediately redirect to /screening-questions/language-preference if there is a previousCaseId', () => {
      session.previousCaseId = 'TestCaseId';
      expect(underTest.nextStep(session)).to.eql(s.steps.ScreeningQuestionsLanguagePreference);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });
  });
});

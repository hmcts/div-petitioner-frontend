const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/marriage/in-the-uk';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.MarriedInUk;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required', [], session);
    });

    it('redirects to the next page if married in UK', done => {
      const context = { marriedInUk: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionHabitualResidence);
    });

    it('redirects to next page if not married in UK', done => {
      const context = { marriedInUk: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.AboutYourMarriageCertificate);
    });
  });

  describe('Check Your Answers', () => {
    let session = {};

    beforeEach(() => {
      session = { divorceWho: 'wife' };
    });

    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders "Did you marry your wife in the UK?" Yes', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['marriedInUk'];

      const context = { marriedInUk: 'Yes' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders "Did you marry your wife in the UK?" No', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['marriedInUk'];

      const context = { marriedInUk: 'No' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });
  });
});

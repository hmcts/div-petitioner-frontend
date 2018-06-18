const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/marriage/names';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.MarriageNames;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('content', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };

      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });
  });

  describe('errors', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'husband' };

      withSession(done, agent, session);
    });

    it('renders errors for missing required context', done => {
      const context = { divorceWho: 'husband' };

      const onlyKeys = [
        'petitionerFirstName',
        'petitionerLastName',
        'respondentFirstName',
        'respondentLastName'
      ];

      testErrors(done, agent, underTest, context, content, 'required', onlyKeys, session);
    });
  });

  describe('success', () => {
    it('redirects to the next page', done => {
      const context = {
        petitionerFirstName: 'John',
        petitionerLastName: 'Smith',
        respondentFirstName: 'Alice',
        respondentLastName: 'Brown'
      };

      const nextStep = s.steps.MarriageCertificateNames;

      testRedirect(done, agent, underTest, context, nextStep);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders the petitioner and respondent first and last names', done => {
      const contentToExist = [
        'yourName',
        'respondentName'
      ];

      const valuesToExist = [
        'petitionerFirstName',
        'petitionerLastName',
        'respondentFirstName',
        'respondentLastName',
        'divorceWho'
      ];

      const context = {
        petitionerFirstName: 'John',
        petitionerLastName: 'Smith',
        respondentFirstName: 'Alice',
        respondentLastName: 'Brown',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

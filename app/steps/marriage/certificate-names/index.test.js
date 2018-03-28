const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/marriage/certificate-names';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.MarriageCertificateNames;
  });

  afterEach(() => {
    s.http.close();
    idamMock.restore();
  });


  describe('content when certificate is in English', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const ignoreContent = [
        'questionTrans',
        'hintTrans',
        'marriagePetitionerNameTrans',
        'marriageRespondentNameTrans'
      ];
      testContent(done, agent, underTest, content, session, ignoreContent);
    });
  });

  describe('content when certificate is not in English', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        certificateInEnglish: 'No'
      };

      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const ignoreContent = [
        'question',
        'hint',
        'marriagePetitionerName',
        'marriageRespondentName'
      ];
      testContent(done, agent, underTest, content, session, ignoreContent);
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

      testErrors(done, agent, underTest, context, content, 'required', [], session);
    });

    it('renders errors for invalid petitioner name', done => {
      const context = { marriagePetitionerName: '£ee' };

      const onlyKeys = ['marriagePetitionerName'];

      testErrors(done, agent, underTest, context, content, 'invalid', onlyKeys, session);
    });

    it('renders errors for invalid respondent name', done => {
      const context = { marriageRespondentName: '£ee' };

      const onlyKeys = ['marriageRespondentName'];

      testErrors(done, agent, underTest, context, content, 'invalid', onlyKeys, session);
    });
  });

  describe('success', () => {
    it('redirects to the next page', done => {
      const context = {
        marriagePetitionerName: 'John Smith',
        marriageRespondentName: 'Sally Smith'
      };

      const nextStep = s.steps.PetitionerChangedNamed;

      testRedirect(done, agent, underTest, context, nextStep);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders the marriage certificate names', done => {
      const contentToExist = [
        'marriagePetitionerName',
        'marriageRespondentName'
      ];

      const valuesToExist = [
        'marriagePetitionerName',
        'marriageRespondentName'
      ];

      const context = {
        marriagePetitionerName: 'John Smith',
        marriageRespondentName: 'Sally Smith',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders names on cya page', done => {
      const contentToExist = [
        'marriagePetitionerName',
        'marriageRespondentName'
      ];

      const valuesToExist = [
        'marriageRespondentName',
        'marriagePetitionerName'
      ];

      const context = {
        marriagePetitionerName: 'name1',
        marriageRespondentName: 'name2',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

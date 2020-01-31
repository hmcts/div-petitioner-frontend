const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');

const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/respondent/solicitor/details';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

// RPET-47: Removing ability for petitioner to add respondent's solicitor details
describe.skip(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.RespondentSolicitorDetails;
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

    it('renders errors for missing context', done => {
      const context = {};

      testErrors(done, agent, underTest, context,
        content, 'required', [], session);
    });

    it('redirects to the RespondentSolicitorAddress with required fields filled', done => {
      const context = {
        respondentSolicitorName: 'Blood sucking leech',
        respondentSolicitorCompany: 'Sue grabbit and run'
      };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentSolicitorAddress);
    });

    it('redirects to the RespondentSolicitorAddress with all fields filled', done => {
      const context = {
        respondentSolicitorName: 'Blood sucking leech',
        respondentSolicitorCompany: 'Sue grabbit and run',
        respondentSolicitorEmail: 'solicitor@example.com',
        respondentSolicitorPhoneNumber: '01234567890'
      };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentSolicitorAddress);
    });
  });

  describe('errors', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders errors for invalid email address and phone number', done => {
      const context = {
        respondentSolicitorName: 'Blood sucking leech',
        respondentSolicitorCompany: 'Sue grabbit and run',
        respondentSolicitorEmail: 'solicitorexamplecom',
        respondentSolicitorPhoneNumber: 'abadnumber'
      };

      testErrors(done, agent, underTest, context,
        content, 'invalid', [], session);
    });
  });

  describe('Watched session values', () => {
    it('removes respondentSolicitorName if respondentCorrespondenceUseHomeAddress is changed and does not equal Solicitor', () => {
      const previousSession = {
        respondentSolicitorName: 'Solicitor Name',
        respondentCorrespondenceUseHomeAddress: 'Solicitor'
      };

      const session = clone(previousSession);
      session.respondentCorrespondenceUseHomeAddress = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentSolicitorName).to.equal('undefined');
    });

    it('removes respondentSolicitorCompany if respondentCorrespondenceUseHomeAddress is changed and does not equal Solicitor', () => {
      const previousSession = {
        respondentSolicitorCompany: 'Solicitor Company',
        respondentCorrespondenceUseHomeAddress: 'Solicitor'
      };

      const session = clone(previousSession);
      session.respondentCorrespondenceUseHomeAddress = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentSolicitorCompany)
        .to.equal('undefined');
    });

    it('removes respondentSolicitorAddress if respondentCorrespondenceUseHomeAddress is changed and does not equal Solicitor', () => {
      const previousSession = {
        respondentSolicitorAddress: ['Address 1', 'Address 2', 'Address 3'],
        respondentCorrespondenceUseHomeAddress: 'Solicitor'
      };

      const session = clone(previousSession);
      session.respondentCorrespondenceUseHomeAddress = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentSolicitorAddress)
        .to.equal('undefined');
    });

    it('removes respondentSolicitorEmail if respondentCorrespondenceUseHomeAddress is changed and does not equal Solicitor', () => {
      const previousSession = {
        respondentSolicitorAddress: ['Address 1', 'Address 2', 'Address 3'],
        respondentCorrespondenceUseHomeAddress: 'Solicitor',
        respondentSolicitorEmail: 'solicitor@example.com'
      };

      const session = clone(previousSession);
      session.respondentCorrespondenceUseHomeAddress = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentSolicitorEmail)
        .to.equal('undefined');
    });

    it('removes respondentSolicitorPhoneNumber if respondentCorrespondenceUseHomeAddress is changed and does not equal Solicitor', () => {
      const previousSession = {
        respondentSolicitorAddress: ['Address 1', 'Address 2', 'Address 3'],
        respondentCorrespondenceUseHomeAddress: 'Solicitor',
        respondentSolicitorPhoneNumber: '01234567890'
      };

      const session = clone(previousSession);
      session.respondentCorrespondenceUseHomeAddress = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentSolicitorPhoneNumber)
        .to.equal('undefined');
    });

    it('removes respondentSolicitorName, respondentSolicitorCompany, respondentSolicitorAddress if respondentCorrespondenceUseHomeAddress is changed and does not equal Solicitor', () => {
      const previousSession = {
        respondentSolicitorName: 'Solicitor Name',
        respondentSolicitorCompany: 'Solicitor Company',
        respondentSolicitorAddress: ['Address 1', 'Address 2', 'Address 3'],
        respondentCorrespondenceUseHomeAddress: 'Solicitor',
        respondentSolicitorEmail: 'solicitor@example.com',
        respondentSolicitorPhoneNumber: '01234567890'
      };

      const session = clone(previousSession);
      session.respondentCorrespondenceUseHomeAddress = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentSolicitorName).to.equal('undefined');
      expect(typeof newSession.respondentSolicitorCompany)
        .to.equal('undefined');
      expect(typeof newSession.respondentSolicitorAddress)
        .to.equal('undefined');
      expect(typeof newSession.respondentSolicitorEmail)
        .to.equal('undefined');
      expect(typeof newSession.respondentSolicitorPhoneNumber)
        .to.equal('undefined');
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders respondentSolicitorName and respondentSolicitorName', done => {
      const contentToExist = ['question'];

      const valuesToExist = [
        'respondentSolicitorName',
        'respondentSolicitorCompany',
        'respondentSolicitorEmail',
        'respondentSolicitorPhoneNumber'
      ];

      const context = {
        respondentSolicitorName: 'Solicitor Name',
        respondentSolicitorCompany: 'Solicitor Company',
        respondentSolicitorEmail: 'solicitor@example.com',
        respondentSolicitorPhoneNumber: '01234567890'
      };

      const session = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });
  });
});

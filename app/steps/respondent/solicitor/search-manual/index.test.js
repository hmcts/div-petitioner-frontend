const request = require('supertest');
const { testContent, testCYATemplate, testExistenceCYA, testErrors, testRedirect } = require('test/util/assertions');
const server = require('app');
const { withSession } = require('test/util/setup');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/petitioner-respondent/solicitor/search-manual';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.RespondentSolicitorSearchManual;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife'
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const excludeKeys = [];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context,
        content, 'required', [], session);
    });

    it('redirects to ReasonForDivorce when mandatory fields are filled', done => {
      const context = {
        respondentSolicitorName: 'Solicitor name',
        respondentSolicitorAddress: 'Solicitor address'
      };

      testRedirect(done, agent, underTest, context, s.steps.ReasonForDivorce);
    });
  });

  describe('Watched session values', () => {
    // TO DO: CHECK ADDRESS IS FORMATTED INTO A LIST
    it('removes respondentCorrespondenceUseHomeAddress if respondentHomeAddress is changed', () => {
      const previousSession = {
        respondentCorrespondenceUseHomeAddress: 'Yes',
        respondentHomeAddress: ['Address 1', 'Address 2', 'Address 3']
      };

      const session = clone(previousSession);
      session.respondentHomeAddress = ['Address 1', 'Address 2'];

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentCorrespondenceUseHomeAddress)
        .to.equal('undefined');
    });

    it('remove respondentCorrespondenceUseHomeAddress if respondentHomeAddress is changed', () => {
      const previousSession = {
        respondentCorrespondenceUseHomeAddress: 'Yes',
        respondentHomeAddress: ['Address 1', 'Address 2', 'Address 3']
      };

      const session = clone(previousSession);
      delete session.respondentHomeAddress;

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentCorrespondenceUseHomeAddress)
        .to.equal('undefined');
    });

    it('remove respondentCorrespondenceAddress if respondentCorrespondenceUseHomeAddress is changed and is not yes', () => {
      const previousSession = {
        respondentCorrespondenceUseHomeAddress: 'Yes',
        respondentCorrespondenceAddress: ['Address 1', 'Address 2', 'Address 3']
      };

      const session = clone(previousSession);
      session.respondentHomeAddress = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentCorrespondenceAddress)
        .to.equal('undefined');
    });
  });

  describe('Check Your Answers', () => {
    // TO DO: CHECK IT DISPLAYS ON CHECK YOUR ANSWERS PAGE
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when respondentCorrespondenceUseHomeAddress is yes', done => {
      const contentToExist = [
        'question',
        'yes'
      ];

      const valuesToExist = ['livingArrangementsLastLivedTogetherAddress'];
      const context = { respondentCorrespondenceUseHomeAddress: 'Yes' };
      const session = { divorceWho: 'wife', livingArrangementsLastLivedTogetherAddress: { address: ['line 1', 'line 2', 'line 3', 'postcode'] } };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when respondentCorrespondenceUseHomeAddress is no', done => {
      const contentToExist = [
        'question',
        'no'
      ];

      const valuesToExist = ['livingArrangementsLastLivedTogetherAddress'];
      const context = { respondentCorrespondenceUseHomeAddress: 'No' };
      const session = { divorceWho: 'wife', livingArrangementsLastLivedTogetherAddress: { address: ['line 1', 'line 2', 'line 3', 'postcode'] } };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });
  });
});

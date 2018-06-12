const request = require('supertest');
const { testContent, testCYATemplate, testExistenceCYA, testErrors, testRedirect, testExistence } = require('test/util/assertions');
const server = require('app');
const { withSession } = require('test/util/setup');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/respondent/correspondence/use-home-address';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.RespondentCorrespondenceUseHomeAddress;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        respondentHomeAddress: {
          address: [
            '82',
            'Landor Road',
            'SW9 9PE'
          ]
        }
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const excludeKeys = ['solicitor-husband'];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context,
        content, 'required', [], session);
    });

    it('redirects to ReasonForDivorce when Yes is selected', done => {
      const context = { respondentCorrespondenceUseHomeAddress: 'Yes' };

      testRedirect(done, agent, underTest, context, s.steps.ReasonForDivorce);
    });

    it('redirects to RespondentCorrespondenceAddress when No is selected', done => {
      const context = { respondentCorrespondenceUseHomeAddress: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentCorrespondenceAddress);
    });

    it('redirects to RespondentSolicitorDetails when No is selected', done => {
      const context = { respondentCorrespondenceUseHomeAddress: 'Solicitor' };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentSolicitorDetails);
    });
  });


  describe('when respondent lives at same address', () => {
    let session = {};

    beforeEach(done => {
      session = {
        livingArrangementsLiveTogether: 'Yes',
        petitionerHomeAddress: { address: ['a', 'place', 'in', 'the', 'when respondent lives at same address'] }
      };
      withSession(done, agent, session);
    });

    it('redirects to the RespondentCorrespondenceUseHomeAddress', done => {
      testExistence(done, agent, underTest,
        'when respondent lives at same address');
    });
  });

  describe('when respondent home address is known', () => {
    let session = {};

    beforeEach(done => {
      session = { respondentHomeAddress: { address: ['a', 'place', 'in', 'the', 'when respondent home address is known'] } };
      withSession(done, agent, session);
    });

    it('redirects to the RespondentCorrespondenceUseHomeAddress', done => {
      testExistence(done, agent, underTest,
        'when respondent home address is known');
    });
  });

  describe('Watched session values', () => {
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

    it('renders when respondentCorrespondenceUseHomeAddress is solicitor and divorceWho is wife', done => {
      const contentToExist = [
        'question',
        'solicitor-wife'
      ];

      const valuesToExist = ['livingArrangementsLastLivedTogetherAddress'];

      const context = { respondentCorrespondenceUseHomeAddress: 'Solicitor' };

      const session = { divorceWho: 'wife', livingArrangementsLastLivedTogetherAddress: { address: ['line 1', 'line 2', 'line 3', 'postcode'] } };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when respondentCorrespondenceUseHomeAddress is solicitor and divorceWho is husband', done => {
      const contentToExist = [
        'question',
        'solicitor-husband'
      ];

      const valuesToExist = ['livingArrangementsLastLivedTogetherAddress'];

      const context = { respondentCorrespondenceUseHomeAddress: 'Solicitor' };

      const session = { divorceWho: 'husband', livingArrangementsLastLivedTogetherAddress: { address: ['line 1', 'line 2', 'line 3', 'postcode'] } };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });
  });
});

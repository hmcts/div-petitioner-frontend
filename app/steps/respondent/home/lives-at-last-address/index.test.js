const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect, postData, expectSessionValue
} = require('test/util/assertions');
const server = require('app');
const { withSession } = require('test/util/setup');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/respondent/home/lives-at-last-address';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.RespondentLivesAtLastAddress;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'husband',
        livingArrangementsLastLivedTogetherAddress: { address: ['80', 'Landor Road', 'London'] }
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const excludeKeys = ['no-wife', 'unknown-wife'];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context,
        content, 'required', [], session);
    });

    it('redirects to RespondentCorrespondenceUseHomeAddress when Yes is selected', done => {
      const context = { respondentLivesAtLastAddress: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentCorrespondenceUseHomeAddress);
    });

    it('redirects to RespondentHomeAddress when No is selected', done => {
      const context = { respondentLivesAtLastAddress: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentHomeAddress);
    });

    it('redirects to RespondentCorrespondenceSendToSolicitor when No is selected', done => {
      const context = { respondentLivesAtLastAddress: 'Unknown' };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentCorrespondenceSendToSolicitor);
    });
  });

  describe('modifies session data when the step posts succesfully', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'husband',
        livingArrangementsLastLivedTogetherAddress: { address: ['80', 'Landor Road', 'London'] },
        respondentHomeAdress: { address: ['90', 'Landor', 'London'] }
      };
      withSession(done, agent, session);
    });

    it('should set respondentHomeAddress when the petitioner selects respondent still lives there', done => {
      postData(agent, s.steps.RespondentLivesAtLastAddress.url, { respondentLivesAtLastAddress: 'Yes' })
        .then(expectSessionValue(
          'respondentHomeAddress',
          session.livingArrangementsLastLivedTogetherAddress,
          agent,
          done
        ))
        .catch(error => {
          done(error);
        });
    });

    it('should not set respondentHomeAddress when the petitioner selects respondent does not live there', done => {
      postData(agent, s.steps.RespondentLivesAtLastAddress.url, { respondentLivesAtLastAddress: 'No' })
        .then(expectSessionValue(
          'respondentHomeAddress',
          session.respondentHomeAddress,
          agent,
          done
        ))
        .catch(error => {
          done(error);
        });
    });
  });

  describe('Watched session values', () => {
    it('removes respondentLivesAtLastAddress if livingArrangementsLastLivedTogetherAddress is changed', () => {
      const previousSession = {
        respondentLivesAtLastAddress: ['Address 1', 'Address 2', 'Address 3'],
        livingArrangementsLastLivedTogetherAddress: 'Yes'
      };

      const session = clone(previousSession);
      session.livingArrangementsLastLivedTogetherAddress = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentLivesAtLastAddress)
        .to.equal('undefined');
    });

    it('removes respondentLivesAtLastAddress if livingArrangementsLastLivedTogetherAddress is changed', () => {
      const previousSession = {
        respondentLivesAtLastAddress: ['Address 1', 'Address 2', 'Address 3'],
        livingArrangementsLastLivedTogetherAddress: 'Yes'
      };

      const session = clone(previousSession);
      delete session.livingArrangementsLastLivedTogetherAddress;

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentLivesAtLastAddress)
        .to.equal('undefined');
    });

    it('does not remove respondentLivesAtLastAddress if livingArrangementsLastLivedTogetherAddress if it is not changed', () => {
      const previousSession = {
        respondentLivesAtLastAddress: ['Address 1', 'Address 2', 'Address 3'],
        livingArrangementsLastLivedTogetherAddress: 'Yes'
      };

      const session = clone(previousSession);
      session.livingArrangementsLastLivedTogetherAddress = 'Yes';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.respondentLivesAtLastAddress)
        .to.equal(previousSession.respondentLivesAtLastAddress);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when respondentLivesAtLastAddress is yes', done => {
      const contentToExist = [
        'question',
        'yes'
      ];

      const valuesToExist = ['livingArrangementsLastLivedTogetherAddress'];

      const context = { respondentLivesAtLastAddress: 'Yes' };

      const session = { divorceWho: 'wife', livingArrangementsLastLivedTogetherAddress: { address: ['line 1', 'line 2', 'line 3', 'postcode'] } };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when respondentLivesAtLastAddress is no and wife', done => {
      const contentToExist = [
        'question',
        'no-wife'
      ];

      const valuesToExist = ['livingArrangementsLastLivedTogetherAddress'];

      const context = { respondentLivesAtLastAddress: 'No' };

      const session = { divorceWho: 'wife', livingArrangementsLastLivedTogetherAddress: { address: ['line 1', 'line 2', 'line 3', 'postcode'] } };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when respondentLivesAtLastAddress is no and husband', done => {
      const contentToExist = [
        'question',
        'no-husband'
      ];

      const valuesToExist = ['livingArrangementsLastLivedTogetherAddress'];

      const context = { respondentLivesAtLastAddress: 'No' };

      const session = { divorceWho: 'husband', livingArrangementsLastLivedTogetherAddress: { address: ['line 1', 'line 2', 'line 3', 'postcode'] } };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when respondentLivesAtLastAddress is unknown and wife', done => {
      const contentToExist = [
        'question',
        'unknown-wife'
      ];

      const valuesToExist = ['livingArrangementsLastLivedTogetherAddress'];

      const context = { respondentLivesAtLastAddress: 'Unknown' };

      const session = { divorceWho: 'wife', livingArrangementsLastLivedTogetherAddress: { address: ['line 1', 'line 2', 'line 3', 'postcode'] } };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when respondentLivesAtLastAddress is unknown and husband', done => {
      const contentToExist = [
        'question',
        'unknown-husband'
      ];

      const valuesToExist = ['livingArrangementsLastLivedTogetherAddress'];

      const context = { respondentLivesAtLastAddress: 'Unknown' };

      const session = { divorceWho: 'husband', livingArrangementsLastLivedTogetherAddress: { address: ['line 1', 'line 2', 'line 3', 'postcode'] } };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });
  });
});

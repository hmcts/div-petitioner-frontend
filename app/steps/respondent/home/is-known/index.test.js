const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const server = require('app');
const { withSession } = require('test/util/setup');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/respondent/home/is-known';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.RespondentHomeAddressIsKnown;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'husband' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required', [], session);
    });

    it('redirects to RespondentHomeAddress when Yes is selected', done => {
      const context = { respondentKnowsHomeAddress: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentHomeAddress);
    });

    it('redirects to RespondentCorrespondenceSendToSolicitor when No is selected', done => {
      const context = { respondentKnowsHomeAddress: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentCorrespondenceSendToSolicitor);
    });
  });

  describe('Watched session values', () => {
    it('removes respondentKnowsHomeAddress if respondentLivesAtLastAddress is changed', () => {
      const previousSession = {
        respondentLivesAtLastAddress: 'Yes',
        respondentKnowsHomeAddress: 'Yes'
      };

      const session = clone(previousSession);
      session.respondentLivesAtLastAddress = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentKnowsHomeAddress)
        .to.equal('undefined');
    });

    it('removes respondentKnowsHomeAddress if livingArrangementsLastLivedTogether is changed', () => {
      const previousSession = {
        livingArrangementsLastLivedTogether: 'Yes',
        respondentKnowsHomeAddress: 'Yes'
      };

      const session = clone(previousSession);
      session.livingArrangementsLastLivedTogether = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentKnowsHomeAddress)
        .to.equal('undefined');
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when respondentKnowsHomeAddress is yes', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['respondentKnowsHomeAddress'];

      const context = { respondentKnowsHomeAddress: 'Yes' };

      const session = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when respondentKnowsHomeAddress is no', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['respondentKnowsHomeAddress'];

      const context = { respondentKnowsHomeAddress: 'No' };

      const session = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });
  });
});

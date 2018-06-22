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

const modulePath = 'app/steps/respondent/correspondence/send-to-solicitor';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.RespondentCorrespondenceSendToSolicitor;
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
      const excludeKeys = ['solicitor-husband'];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context,
        content, 'required', [], session);
    });

    it('redirects to the RespondentSolicitorDetails page', done => {
      const context = { respondentCorrespondenceSendToSolicitor: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentSolicitorDetails);
    });

    it('redirects to the RespondentCorrespondenceAddress page', done => {
      const context = { respondentCorrespondenceSendToSolicitor: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentCorrespondenceAddress);
    });
  });

  describe('Watched session values', () => {
    it('removes respondentCorrespondenceSendToSolicitor if respondentAskToUseHomeAddress is changed to true', () => {
      const previousSession = {
        respondentCorrespondenceSendToSolicitor: 'Yes',
        respondentAskToUseHomeAddress: 'false'
      };

      const session = clone(previousSession);
      session.respondentAskToUseHomeAddress = 'true';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentCorrespondenceUseHomeAddress)
        .to.equal('undefined');
    });

    it('does not remove respondentCorrespondenceSendToSolicitor if respondentAskToUseHomeAddress is changed to false', () => {
      const previousSession = {
        respondentCorrespondenceSendToSolicitor: 'Yes',
        respondentAskToUseHomeAddress: 'true'
      };

      const session = clone(previousSession);
      session.respondentAskToUseHomeAddress = 'false';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.respondentCorrespondenceUseHomeAddress)
        .to.equal(session.respondentCorrespondenceUseHomeAddress);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when respondentCorrespondenceSendToSolicitor is yes and divorceWho is wife', done => {
      const contentToExist = [
        'question',
        'solicitor-wife'
      ];

      const valuesToExist = [];

      const context = { respondentCorrespondenceSendToSolicitor: 'Yes' };

      const session = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when respondentCorrespondenceSendToSolicitor is yes and divorceWho is husband', done => {
      const contentToExist = [
        'question',
        'solicitor-husband'
      ];

      const valuesToExist = [];

      const context = { respondentCorrespondenceSendToSolicitor: 'Yes' };

      const session = { divorceWho: 'husband' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when respondentCorrespondenceSendToSolicitor is no', done => {
      const contentToExist = [
        'question',
        'correspondence'
      ];

      const valuesToExist = [];

      const context = { respondentCorrespondenceSendToSolicitor: 'No' };

      const session = { divorceWho: 'husband' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });
  });
});

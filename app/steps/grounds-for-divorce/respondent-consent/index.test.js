const request = require('supertest');
const server = require('app');
const {
  testContent, testErrors, testRedirect,
  testCYATemplate, testExistenceCYA
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/grounds-for-divorce/respondent-consent';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.RespondentConsent;
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

      testErrors(done, agent, underTest, context, content, 'required', 'divorceWho', session);
    });

    it('redirects to the next page when answer is No', done => {
      const context = { reasonForDivorceRespondentConsent: 'No' };

      testRedirect(done, agent, underTest, context, s.steps.SeparationDate);
    });

    it('redirects to the next page when answer is Yes', done => {
      const context = { reasonForDivorceRespondentConsent: 'Yes' };

      testRedirect(done, agent, underTest, context, s.steps.SeparationDate);
    });
  });

  describe('Watched session values', () => {
    it('removes reasonForDivorceRespondentConsent fields if reasonForDivorce is changed', () => {
      const previousSession = {
        reasonForDivorceRespondentConsent: 'Yes',
        reasonForDivorce: 'separation-2-years'
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'anything';

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.reasonForDivorceRespondentConsent)
        .to.equal('undefined');
    });

    it('do not remove reasonForDivorceRespondentConsent fields if reasonForDivorce does not change', () => {
      const previousSession = {
        reasonForDivorceRespondentConsent: 'No',
        reasonForDivorce: 'separation-2-years'
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'separation-2-years';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.reasonForDivorceRespondentConsent)
        .to.equal(previousSession.reasonForDivorceRespondentConsent);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders desertion agreement', done => {
      const contentToExist = [ 'question' ];

      const valuesToExist = [
        'reasonForDivorceRespondentConsent',
        'divorceWho'
      ];

      const context = {
        reasonForDivorceRespondentConsent: 'Yes',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

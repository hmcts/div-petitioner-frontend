const request = require('supertest');
const {
  testContent, testErrors, testRedirect,
  testCYATemplate, testExistenceCYA
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/jurisdiction/habitual-residence';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.JurisdictionHabitualResidence;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('Habitual residence step content', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });
  });

  describe('Habitual residence step errors', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders errors for missing jurisdictionPetitionerResidence context', done => {
      const context = {};

      testErrors(done, agent, underTest, context,
        content, 'jurisdictionPetitionerResidence.required', 'divorceWho');
    });

    it('renders errors for missing jurisdictionRespondentResidence context', done => {
      const context = { jurisdictionPetitionerResidence: 'Yes' };

      testErrors(done, agent, underTest, context,
        content, 'jurisdictionRespondentResidence.required', 'divorceWho');
    });
  });

  describe('Habitual residence routing', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both resident', done => {
      const context = {
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionRespondentResidence: 'Yes'
      };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionInterstitial);
    });

    it('redirects to the next page for respondent resident', done => {
      const context = {
        jurisdictionPetitionerResidence: 'No',
        jurisdictionRespondentResidence: 'Yes'
      };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionInterstitial);
    });

    it('redirects to the next page for petitioner resident', done => {
      const context = {
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionRespondentResidence: 'No'
      };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLastTwelveMonths);
    });

    it('redirects to the next page for neither resident', done => {
      const context = {
        jurisdictionPetitionerResidence: 'No',
        jurisdictionRespondentResidence: 'No'
      };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionDomicile);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders jurisdictionPetitionerResidence and jurisdictionRespondentResidence', done => {
      const contentToExist = [
        'petitioner',
        'respondent'
      ];

      const valuesToExist = [
        'jurisdictionPetitionerResidence',
        'jurisdictionRespondentResidence'
      ];

      const context = {
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionRespondentResidence: 'Yes'
      };

      const session = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });
  });
});

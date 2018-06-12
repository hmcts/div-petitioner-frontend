const request = require('supertest');
const { testContent, testErrors, postData, getSession, testCYATemplate, testExistenceCYA } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { expect } = require('test/util/chai');

const modulePath = 'app/steps/jurisdiction/last-six-months';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.JurisdictionLastSixMonths;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('Six months content step content', () => {
    let session = {};

    beforeEach(done => {
      session = {};
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });
  });

  describe('Six months content step errors', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders errors for missing input', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'jurisdictionLastSixMonths.required');
    });
  });

  describe('Given we have been to this page before and picked up connection E, and petitioner is habitually resident and domiciled', () => {
    let session = {};

    beforeEach(done => {
      session = {
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionRespondentResidence: 'No',
        jurisdictionPetitionerDomicile: 'Yes',
        jurisdictionRespondentDomicile: 'No',
        jurisdictionLastTwelveMonths: 'No',
        jurisdictionConnection: ['E'],
        jurisdictionPath: ['JurisdictionHabitualResidence', 'JurisdictionLastTwelveMonths']
      };
      withSession(done, agent, session);
    });
    it('when the petitioner is habitually resident for at least six months then we redirect to the interstitial page and we have connection E', done => {
      postData(agent, underTest.url, { jurisdictionLastSixMonths: 'Yes' })
        .then(location => {
          expect(location).to.equal(s.steps.JurisdictionInterstitial.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.include('E');
        })
        .then(done, done);
    });
  });


  describe('Given no prior connections, and petitioner is habitually resident and domiciled', () => {
    let session = {};

    beforeEach(done => {
      session = {
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionRespondentResidence: 'No',
        jurisdictionPetitionerDomicile: 'Yes',
        jurisdictionRespondentDomicile: 'No',
        jurisdictionLastTwelveMonths: 'No',
        jurisdictionConnection: [],
        jurisdictionPath: ['JurisdictionHabitualResidence', 'JurisdictionLastTwelveMonths']
      };
      withSession(done, agent, session);
    });
    it('when the petitioner is habitually resident for at least six months then we redirect to the interstitial page and we have connection E', done => {
      postData(agent, underTest.url, { jurisdictionLastSixMonths: 'Yes' })
        .then(location => {
          expect(location).to.equal(s.steps.JurisdictionInterstitial.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.include('E');
        })
        .then(done, done);
    });
    it('when the petitioner is habitually resident for less than six months then we redirect to the JurisdictionLastHabitualResidence page and we do not have connection E', done => {
      postData(agent, underTest.url, { jurisdictionLastSixMonths: 'No' })
        .then(location => {
          expect(location)
            .to.equal(s.steps.JurisdictionLastHabitualResidence.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.not.include('E');
        })
        .then(done, done);
    });
  });

  describe('Given prior connections, and petitioner is habitually resident and domiciled', () => {
    let session = {};

    beforeEach(done => {
      session = {
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionRespondentResidence: 'Yes',
        jurisdictionPetitionerDomicile: 'Yes',
        jurisdictionRespondentDomicile: 'No',
        jurisdictionLastTwelveMonths: 'No',
        jurisdictionPath: ['JurisdictionHabitualResidence', 'JurisdictionLastTwelveMonths'],
        jurisdictionConnection: ['A']
      };
      withSession(done, agent, session);
    });
    it('when the petitioner is habitually resident for at least six months then we redirect to the JurisdictionLastHabitualResidence page and we have connection E', done => {
      postData(agent, underTest.url, { jurisdictionLastSixMonths: 'Yes' })
        .then(location => {
          expect(location).to.equal(s.steps.JurisdictionConnectionSummary.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.include('E');
        })
        .then(done, done);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when jurisdictionLastSixMonths is Yes', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['jurisdictionLastSixMonths'];

      const context = { jurisdictionLastSixMonths: 'Yes' };

      const session = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when jurisdictionLastSixMonths is No', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['jurisdictionLastSixMonths'];

      const context = { jurisdictionLastSixMonths: 'No' };

      const session = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });
  });
});

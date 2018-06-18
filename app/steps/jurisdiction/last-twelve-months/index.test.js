const request = require('supertest');
const { testContent, testErrors, getSession, postData, testCYATemplate, testExistenceCYA } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { expect } = require('test/util/chai');

const modulePath = 'app/steps/jurisdiction/last-twelve-months';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.JurisdictionLastTwelveMonths;
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
  });

  describe('error', () => {
    it('renders the errors when context not provided', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });
  });

  describe('Given we have been to this page before and we previously obtained this connection', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionConnection: ['D'],
        jurisdictionPath: ['JurisdictionHabitualResidence']
      };
      withSession(done, agent, session);
    });

    it('when 12MonthsResidence is \'Yes\' and we have connection D then we redirect to the interstitial page', done => {
      postData(agent, underTest.url, { jurisdictionLastTwelveMonths: 'Yes' })
        .then(location => {
          expect(location).to.equal(s.steps.JurisdictionInterstitial.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.include('D');
        })
        .then(done, done);
    });
  });


  describe('Given no prior connections', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionConnection: [],
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionPath: ['JurisdictionHabitualResidence']
      };
      withSession(done, agent, session);
    });

    it('when 12MonthsResidence is \'Yes\' and we have connection D then we redirect to the interstitial page', done => {
      postData(agent, underTest.url, { jurisdictionLastTwelveMonths: 'Yes' })
        .then(location => {
          expect(location).to.equal(s.steps.JurisdictionInterstitial.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.include('D');
        })
        .then(done, done);
    });

    it('when 12MonthsResidence is \'No\' then we redirect to the domicile page and we do not have connection D', done => {
      postData(agent, underTest.url, { jurisdictionLastTwelveMonths: 'No' })
        .then(location => {
          expect(location).to.equal(s.steps.JurisdictionDomicile.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.not.include('D');
        })
        .then(done, done);
    });
  });

  describe('Given a prior connection', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionRespondentResidence: 'Yes',
        jurisdictionPath: ['JurisdictionHabitualResidence', 'JurisdictionInterstitial']
      };
      withSession(done, agent, session);
    });

    it('when 12MonthsResidence is \'Yes\' and we have connection D then we redirect to the domicile page ', done => {
      postData(agent, underTest.url, { jurisdictionLastTwelveMonths: 'Yes' })
        .then(location => {
          expect(location).to.equal(s.steps.JurisdictionDomicile.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.include('D');
        })
        .then(done, done);
    });

    it('when 12MonthsResidence is \'No\' then we redirect to the domicile page and we do not have connection D', done => {
      postData(agent, underTest.url, { jurisdictionLastTwelveMonths: 'No' })
        .then(location => {
          expect(location).to.equal(s.steps.JurisdictionDomicile.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.not.include('D');
        })
        .then(done, done);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when jurisdictionLastTwelveMonths is Yes', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['jurisdictionLastTwelveMonths'];

      const context = { jurisdictionLastTwelveMonths: 'Yes' };

      const session = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when jurisdictionLastTwelveMonths is No', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['jurisdictionLastTwelveMonths'];

      const context = { jurisdictionLastTwelveMonths: 'No' };

      const session = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });
  });
});

const request = require('supertest');
const { testContent, testErrors, postData, getSession, testCYATemplate, testExistenceCYA } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { expect } = require('test/util/chai');

const modulePath = 'app/steps/jurisdiction/domicile';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.JurisdictionDomicile;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('Domicile step content', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });
  });

  describe('Domicile step errors', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders errors for missing jurisdictionPetitionerDomicile context', done => {
      const context = {};

      testErrors(done, agent, underTest, context,
        content, 'jurisdictionPetitionerDomicile.required', 'divorceWho');
    });

    it('renders errors for missing jurisdictionRespondentDomicile context', done => {
      const context = { jurisdictionPetitionerDomicile: 'Yes' };

      testErrors(done, agent, underTest, context,
        content, 'jurisdictionRespondentDomicile.required', 'divorceWho');
    });
  });


  describe('Given we have been to this page before and we previously obtained this connection', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionConnection: ['F'],
        jurisdictionPath: ['JurisdictionHabitualResidence', 'JurisdictionLastTwelveMonths']
      };
      withSession(done, agent, session);
    });

    it('when both are Domiciled then we redirect to the interstitial page and we have connection F', done => {
      postData(agent, underTest.url, {
        jurisdictionPetitionerDomicile: 'Yes',
        jurisdictionRespondentDomicile: 'Yes'
      })
        .then(location => {
          expect(location).to.equal(s.steps.JurisdictionInterstitial.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.include('F');
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
        jurisdictionPath: ['JurisdictionHabitualResidence'],
        jurisdictionPetitionerResidence: 'No',
        jurisdictionRespondentResidence: 'No'
      };
      withSession(done, agent, session);
    });

    it('when both are Domiciled then we redirect to the interstitial page and we have connection F', done => {
      postData(agent, underTest.url, {
        jurisdictionPetitionerDomicile: 'Yes',
        jurisdictionRespondentDomicile: 'Yes'
      })
        .then(location => {
          expect(location).to.equal(s.steps.JurisdictionInterstitial.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.include('F');
        })
        .then(done, done);
    });

    it('when petitioner only is Domiciled then we redirect to the JurisdictionLastHabitualResidence page and we do not have connection F', done => {
      postData(agent, underTest.url, {
        jurisdictionPetitionerDomicile: 'Yes',
        jurisdictionRespondentDomicile: 'No'
      })
        .then(location => {
          expect(location)
            .to.equal(s.steps.JurisdictionLastHabitualResidence.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.not.include('F');
        })
        .then(done, done);
    });

    it('when respondent only is Domiciled then we redirect to the JurisdictionLastHabitualResidence page and we do not have connection F', done => {
      postData(agent, underTest.url, {
        jurisdictionPetitionerDomicile: 'No',
        jurisdictionRespondentDomicile: 'Yes'
      })
        .then(location => {
          expect(location)
            .to.equal(s.steps.JurisdictionLastHabitualResidence.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.not.include('F');
        })
        .then(done, done);
    });

    it('when neither is Domiciled then we redirect to the JurisdictionLastHabitualResidence page and we do not have connection F', done => {
      postData(agent, underTest.url, {
        jurisdictionPetitionerDomicile: 'No',
        jurisdictionRespondentDomicile: 'No'
      })
        .then(location => {
          expect(location)
            .to.equal(s.steps.JurisdictionLastHabitualResidence.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.not.include('F');
        })
        .then(done, done);
    });
  });

  describe('Given a prior connection (respondent only is habitually resident) and petitioner is not habitually resident', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPetitionerResidence: 'No',
        jurisdictionRespondentResidence: 'Yes',
        jurisdictionConnection: ['C'],
        jurisdictionPath: ['JurisdictionHabitualResidence']
      };
      withSession(done, agent, session);
    });

    it('when both are Domiciled then we redirect to the JurisdictionLastHabitualResidence page and we have connection F', done => {
      postData(agent, underTest.url, {
        jurisdictionPetitionerDomicile: 'Yes',
        jurisdictionRespondentDomicile: 'Yes'
      })
        .then(location => {
          expect(location)
            .to.equal(s.steps.JurisdictionLastHabitualResidence.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.include('F');
        })
        .then(done, done);
    });
  });

  describe('Given a prior connection (both habitually resident) and Petitioner has been habitually resident for less than 12 Months', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionRespondentResidence: 'Yes',
        jurisdictionLastTwelveMonths: 'No',
        jurisdictionConnection: ['A'],
        jurisdictionPath: ['JurisdictionHabitualResidence', 'JurisdictionLastTwelveMonths']
      };
      withSession(done, agent, session);
    });

    it('when both are Domiciled then we redirect to the 6 months habitually resident page and we have connection F', done => {
      postData(agent, underTest.url, {
        jurisdictionPetitionerDomicile: 'Yes',
        jurisdictionRespondentDomicile: 'Yes'
      })
        .then(location => {
          expect(location).to.equal(s.steps.JurisdictionLastSixMonths.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.include('F');
        })
        .then(done, done);
    });

    it('when petitioner only is Domiciled then we redirect to the 6 months habitually resident page and we do not have connection F', done => {
      postData(agent, underTest.url, {
        jurisdictionPetitionerDomicile: 'Yes',
        jurisdictionRespondentDomicile: 'No'
      })
        .then(location => {
          expect(location).to.equal(s.steps.JurisdictionLastSixMonths.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.not.include('F');
        })
        .then(done, done);
    });

    it('when respondent only is Domiciled then we redirect to the JurisdictionConnectionSummary page and we do not have connection F', done => {
      postData(agent, underTest.url, {
        jurisdictionPetitionerDomicile: 'No',
        jurisdictionRespondentDomicile: 'Yes'
      })
        .then(location => {
          expect(location).to.equal(s.steps.JurisdictionConnectionSummary.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.not.include('F');
        })
        .then(done, done);
    });

    it('when neither is Domiciled then we redirect to the JurisdictionConnectionSummary page and we do not have connection F', done => {
      postData(agent, underTest.url, {
        jurisdictionPetitionerDomicile: 'No',
        jurisdictionRespondentDomicile: 'No'
      })
        .then(location => {
          expect(location).to.equal(s.steps.JurisdictionConnectionSummary.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.not.include('F');
        })
        .then(done, done);
    });
  });

  describe('Given a prior connection (both habitually resident) and Petitioner has been habitually resident for more than 12 Months', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionRespondentResidence: 'Yes',
        jurisdictionLastTwelveMonths: 'Yes'
      };
      withSession(done, agent, session);
    });

    it('when both HR, >12 months, both Domicile', done => {
      postData(agent, underTest.url, {
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionRespondentResidence: 'Yes',
        jurisdictionPetitionerDomicile: 'Yes',
        jurisdictionRespondentDomicile: 'Yes',
        JurisdictionLastTwelveMonths: 'Yes'
      })
        .then(location => {
          expect(location).to.equal(s.steps.JurisdictionConnectionSummary.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.include('A');
          expect(responseSession.jurisdictionConnection).to.include('C');
          expect(responseSession.jurisdictionConnection).to.include('D');
          expect(responseSession.jurisdictionConnection).to.include('E');
          expect(responseSession.jurisdictionConnection).to.include('F');
        })
        .then(done, done);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders jurisdictionPetitionerDomicile and jurisdictionRespondentDomicile', done => {
      const contentToExist = [
        'petitioner',
        'respondent'
      ];

      const valuesToExist = [
        'jurisdictionPetitionerDomicile',
        'jurisdictionRespondentDomicile'
      ];

      const context = {
        jurisdictionPetitionerDomicile: 'Yes',
        jurisdictionRespondentDomicile: 'Yes'
      };

      const session = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });
  });
});

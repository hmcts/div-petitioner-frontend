/* eslint-disable max-nested-callbacks  */
const request = require('supertest');
const { testContent, testErrors, postData, getSession, testCYATemplate, testExistenceCYA } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { expect } = require('test/util/chai');

const modulePath = 'app/steps/jurisdiction/last-habitual-residence';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.JurisdictionLastHabitualResidence;
  });


  afterEach(() => {
    s.http.close();
    idamMock.restore();
  });


  describe('Last Habitual residence step content', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });
  });

  describe('Last Habitual residence step errors', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders errors for missing jurisdictionLastHabitualResident context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'jurisdictionLastHabitualResident.required', 'divorceWho');
    });
  });

  describe('Given we have no connections', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionConnection: [],
        marriageIsSameSexCouple: '',
        jurisdictionPetitionerDomicile: '',
        jurisdictionRespondentDomicile: ''
      };
      withSession(done, agent, session);
    });

    it('when yes is selected redirect to JurisdictionInterstitial and set connection B', done => {
      postData(agent, underTest.url, { jurisdictionLastHabitualResident: 'Yes' })
        .then(location => {
          expect(location).to.equal(s.steps.JurisdictionInterstitial.url);
        })
        .then(() => {
          return getSession(agent);
        })
        .then(responseSession => {
          expect(responseSession.jurisdictionConnection).to.include('B');
        })
        .then(done);
    });

    it('when no is selected opposite sex, neither P or R are domiciled redirect to ExitNoConnections and no connection is set', done => {
      session = {
        marriageIsSameSexCouple: 'No',
        jurisdictionPetitionerDomicile: 'No',
        jurisdictionRespondentDomicile: 'No'
      };
      withSession(() => {
        postData(agent, underTest.url, { jurisdictionLastHabitualResident: 'No' })
          .then(location => {
            expect(location).to.equal(s.steps.ExitNoConnections.url);
          })
          .then(() => {
            return getSession(agent);
          })
          .then(responseSession => {
            expect(responseSession.jurisdictionConnection.length).to.equal(0);
            expect(responseSession.marriageIsSameSexCouple).to.equal('No');
            expect(responseSession.jurisdictionPetitionerDomicile).to.equal('No');
            expect(responseSession.jurisdictionRespondentDomicile).to.equal('No');
          })
          .then(done, done);
      }, agent, session);
    });

    it('when no is selected opposite sex, P is domiciled and R is not domiciled redirect to JurisdictionResidual and no connection is set', done => {
      session = {
        marriageIsSameSexCouple: 'No',
        jurisdictionPetitionerDomicile: 'Yes',
        jurisdictionRespondentDomicile: 'No'
      };
      withSession(() => {
        postData(agent, underTest.url, { jurisdictionLastHabitualResident: 'No' })
          .then(location => {
            expect(location).to.equal(s.steps.JurisdictionResidual.url);
          })
          .then(() => {
            return getSession(agent);
          })
          .then(responseSession => {
            expect(responseSession.jurisdictionConnection.length).to.equal(0);
            expect(responseSession.marriageIsSameSexCouple).to.equal('No');
            expect(responseSession.jurisdictionPetitionerDomicile).to.equal('Yes');
            expect(responseSession.jurisdictionRespondentDomicile).to.equal('No');
          })
          .then(done, done);
      }, agent, session);
    });

    it('when no is selected opposite sex, P is not domiciled and R is domiciled redirect to JurisdictionResidual and no connection is set', done => {
      session = {
        marriageIsSameSexCouple: 'No',
        jurisdictionPetitionerDomicile: 'No',
        jurisdictionRespondentDomicile: 'Yes'

      };
      withSession(() => {
        postData(agent, underTest.url, { jurisdictionLastHabitualResident: 'No' })
          .then(location => {
            expect(location).to.equal(s.steps.JurisdictionResidual.url);
          })
          .then(() => {
            return getSession(agent);
          })
          .then(responseSession => {
            expect(responseSession.jurisdictionConnection.length).to.equal(0);
            expect(responseSession.marriageIsSameSexCouple).to.equal('No');
            expect(responseSession.jurisdictionPetitionerDomicile).to.equal('No');
            expect(responseSession.jurisdictionRespondentDomicile).to.equal('Yes');
          })
          .then(done, done);
      }, agent, session);
    });

    it('when no is selected same sex, and no connection is set', done => {
      session = { marriageIsSameSexCouple: 'Yes' };
      withSession(() => {
        postData(agent, underTest.url, { jurisdictionLastHabitualResident: 'No' })
          .then(location => {
            expect(location).to.equal(s.steps.JurisdictionResidual.url);
          })
          .then(() => {
            return getSession(agent);
          })
          .then(responseSession => {
            expect(responseSession.jurisdictionConnection.length).to.equal(0);
            expect(responseSession.marriageIsSameSexCouple).to.equal('Yes');
          })
          .then(done, done);
      }, agent, session);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when jurisdictionLastHabitualResident is Yes', done => {
      const contentToExist = ['heading'];

      const valuesToExist = ['jurisdictionLastHabitualResident'];

      const context = { jurisdictionLastHabitualResident: 'Yes' };

      const session = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when jurisdictionLastHabitualResident is No', done => {
      const contentToExist = ['heading'];

      const valuesToExist = ['jurisdictionLastHabitualResident'];

      const context = { jurisdictionLastHabitualResident: 'No' };

      const session = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });
  });
});

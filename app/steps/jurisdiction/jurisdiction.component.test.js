const request = require('supertest');
const { getSession, postData } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { expect } = require('test/util/chai');

const modulePath = 'app/steps/jurisdiction';

let s = {};
let agent = {};

const completePage = (expectedPage, result) => {
  return page => {
    expect(expectedPage.url).to.equal(page);
    return postData(agent, page, result);
  };
};

const expectConnections = (connections, done) => {
  return () => {
    return getSession(agent)
      .then(responseSession => {
        expect(responseSession.jurisdictionConnection).to.eql(connections);
        // expect(responseSession.jurisdictionPath).to.eql(path);   // TODO: to be added if start using jurisdictionPath
      })
      .then(done, done);
  };
};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('Jurisdiction Connections are collected correctly for opposite sex couples', () => {
    let session = {};

    beforeEach(done => {
      // this.timeout(3000);
      session = {
        divorceWho: 'wife',
        marriageIsSameSexCouple: 'No',
        jurisdictionConnection: [],
        jurisdictionPath: []
      };
      withSession(done, agent, session);
    });


    it('collects connections A, C', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'Yes', jurisdictionRespondentResidence: 'Yes' })
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'Yes' }))

        .then(expectConnections(['A', 'C'], done));
    });


    it('collects connections B', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'No', jurisdictionRespondentResidence: 'No' })
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'No', jurisdictionRespondentDomicile: 'No' }))
        .then(completePage(s.steps.JurisdictionLastHabitualResidence, { jurisdictionLastHabitualResident: 'Yes' }))
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'Yes' }))

        .then(expectConnections(['B'], done));
    });


    it('collects connections C', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'No', jurisdictionRespondentResidence: 'Yes' })
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'Yes' }))

        .then(expectConnections(['C'], done));
    });


    it('collects connections D', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'Yes', jurisdictionRespondentResidence: 'No' })
        .then(completePage(s.steps.JurisdictionLastTwelveMonths, { jurisdictionLastTwelveMonths: 'Yes' }))
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'Yes' }))

        .then(expectConnections(['D'], done));
    });


    it('collects connections E', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'Yes', jurisdictionRespondentResidence: 'No' })
        .then(completePage(s.steps.JurisdictionLastTwelveMonths, { jurisdictionLastTwelveMonths: 'No' }))
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'Yes', jurisdictionRespondentDomicile: 'No' }))
        .then(completePage(s.steps.JurisdictionLastSixMonths, { jurisdictionLastSixMonths: 'Yes' }))
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'Yes' }))

        .then(expectConnections(['E'], done));
    });


    it('collects connections F', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'No', jurisdictionRespondentResidence: 'No' })
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'Yes', jurisdictionRespondentDomicile: 'Yes' }))
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'Yes' }))

        .then(expectConnections(['F'], done));
    });


    it('collects connections G (opposite sex, Petitioner domiciled)', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'No', jurisdictionRespondentResidence: 'No' })
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'Yes', jurisdictionRespondentDomicile: 'No' }))
        .then(completePage(s.steps.JurisdictionLastHabitualResidence, { jurisdictionLastHabitualResident: 'No' }))
        .then(completePage(s.steps.JurisdictionResidual, { residualJurisdictionEligible: 'Yes' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['G'], done));
    });


    it('collects connections G (opposite sex, Respondent domiciled)', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'No', jurisdictionRespondentResidence: 'No' })
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'No', jurisdictionRespondentDomicile: 'Yes' }))
        .then(completePage(s.steps.JurisdictionLastHabitualResidence, { jurisdictionLastHabitualResident: 'No' }))
        .then(completePage(s.steps.JurisdictionResidual, { residualJurisdictionEligible: 'Yes' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['G'], done));
    });


    it('collects connections B, C', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'No', jurisdictionRespondentResidence: 'Yes' })
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'No' }))
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'Yes', jurisdictionRespondentDomicile: 'No' }))
        .then(completePage(s.steps.JurisdictionLastHabitualResidence, { jurisdictionLastHabitualResident: 'Yes' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['B', 'C'], done));
    });


    it('collects connections B, D', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'Yes', jurisdictionRespondentResidence: 'No' })
        .then(completePage(s.steps.JurisdictionLastTwelveMonths, { jurisdictionLastTwelveMonths: 'Yes' }))
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'No' }))
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'No', jurisdictionRespondentDomicile: 'Yes' }))
        .then(completePage(s.steps.JurisdictionLastHabitualResidence, { jurisdictionLastHabitualResident: 'Yes' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['B', 'D'], done));
    });


    it('collects connections B, E', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'Yes', jurisdictionRespondentResidence: 'No' })
        .then(completePage(s.steps.JurisdictionLastTwelveMonths, { jurisdictionLastTwelveMonths: 'No' }))
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'Yes', jurisdictionRespondentDomicile: 'No' }))
        .then(completePage(s.steps.JurisdictionLastSixMonths, { jurisdictionLastSixMonths: 'Yes' }))
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'No' }))
        .then(completePage(s.steps.JurisdictionLastHabitualResidence, { jurisdictionLastHabitualResident: 'Yes' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['B', 'E'], done));
    });


    it('collects connections B, F', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'No', jurisdictionRespondentResidence: 'No' })
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'Yes', jurisdictionRespondentDomicile: 'Yes' }))
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'No' }))
        .then(completePage(s.steps.JurisdictionLastHabitualResidence, { jurisdictionLastHabitualResident: 'Yes' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['B', 'F'], done));
    });


    it('collects connections C, F', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'No', jurisdictionRespondentResidence: 'Yes' })
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'No' }))
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'Yes', jurisdictionRespondentDomicile: 'Yes' }))
        .then(completePage(s.steps.JurisdictionLastHabitualResidence, { jurisdictionLastHabitualResident: 'No' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['C', 'F'], done));
    });


    it('collects connections D, E', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'Yes', jurisdictionRespondentResidence: 'No' })
        .then(completePage(s.steps.JurisdictionLastTwelveMonths, { jurisdictionLastTwelveMonths: 'Yes' }))
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'No' }))
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'Yes', jurisdictionRespondentDomicile: 'No' }))
        .then(completePage(s.steps.JurisdictionLastHabitualResidence, { jurisdictionLastHabitualResident: 'No' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['D', 'E'], done));
    });


    it('collects connections A, C, D (neither domiciled)', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'Yes', jurisdictionRespondentResidence: 'Yes' })
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'No' }))
        .then(completePage(s.steps.JurisdictionLastTwelveMonths, { jurisdictionLastTwelveMonths: 'Yes' }))
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'No', jurisdictionRespondentDomicile: 'No' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['A', 'C', 'D'], done));
    });


    it('collects connections A, C, D (Respondent domiciled)', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'Yes', jurisdictionRespondentResidence: 'Yes' })
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'No' }))
        .then(completePage(s.steps.JurisdictionLastTwelveMonths, { jurisdictionLastTwelveMonths: 'Yes' }))
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'No', jurisdictionRespondentDomicile: 'Yes' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['A', 'C', 'D'], done));
    });


    it('collects connections A, C, F', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'Yes', jurisdictionRespondentResidence: 'Yes' })
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'No' }))
        .then(completePage(s.steps.JurisdictionLastTwelveMonths, { jurisdictionLastTwelveMonths: 'No' }))
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'Yes', jurisdictionRespondentDomicile: 'Yes' }))
        .then(completePage(s.steps.JurisdictionLastSixMonths, { jurisdictionLastSixMonths: 'No' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['A', 'C', 'F'], done));
    });


    it('collects connections B, C, F', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'No', jurisdictionRespondentResidence: 'Yes' })
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'No' }))
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'Yes', jurisdictionRespondentDomicile: 'Yes' }))
        .then(completePage(s.steps.JurisdictionLastHabitualResidence, { jurisdictionLastHabitualResident: 'Yes' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['B', 'C', 'F'], done));
    });


    it('collects connections B, D, E', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'Yes', jurisdictionRespondentResidence: 'No' })
        .then(completePage(s.steps.JurisdictionLastTwelveMonths, { jurisdictionLastTwelveMonths: 'Yes' }))
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'No' }))
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'Yes', jurisdictionRespondentDomicile: 'No' }))
        .then(completePage(s.steps.JurisdictionLastHabitualResidence, { jurisdictionLastHabitualResident: 'Yes' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['B', 'D', 'E'], done));
    });


    it('collects connections D, E, F', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'Yes', jurisdictionRespondentResidence: 'No' })
        .then(completePage(s.steps.JurisdictionLastTwelveMonths, { jurisdictionLastTwelveMonths: 'Yes' }))
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'No' }))
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'Yes', jurisdictionRespondentDomicile: 'Yes' }))
        .then(completePage(s.steps.JurisdictionLastHabitualResidence, { jurisdictionLastHabitualResident: 'No' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['D', 'E', 'F'], done));
    });


    it('collects connections A, C, D, E', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'Yes', jurisdictionRespondentResidence: 'Yes' })
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'No' }))
        .then(completePage(s.steps.JurisdictionLastTwelveMonths, { jurisdictionLastTwelveMonths: 'Yes' }))
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'Yes', jurisdictionRespondentDomicile: 'No' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['A', 'C', 'D', 'E'], done));
    });


    it('collects connections A, C, D, E, F', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'Yes', jurisdictionRespondentResidence: 'Yes' })
        .then(completePage(s.steps.JurisdictionInterstitial, { jurisdictionConfidentLegal: 'No' }))
        .then(completePage(s.steps.JurisdictionLastTwelveMonths, { jurisdictionLastTwelveMonths: 'Yes' }))
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'Yes', jurisdictionRespondentDomicile: 'Yes' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['A', 'C', 'D', 'E', 'F'], done));
    });


    it('collects connections A, B, C, D, E, F, G', done => {
      const allConnections = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'No', jurisdictionRespondentResidence: 'No' })
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'No', jurisdictionRespondentDomicile: 'No' }))
        .then(completePage(s.steps.JurisdictionLastHabitualResidence, { jurisdictionLastHabitualResident: 'No' }))
        .then(location => {
          expect(location).to.equal(s.steps.ExitNoConnections.url);
        })
        .then(() => {
          return postData(
            agent,
            s.steps.JurisdictionLastResort.url,
            { jurisdictionLastResortConnections: allConnections }
          );
        })

        .then(expectConnections(['A', 'B', 'C', 'D', 'E', 'F', 'G'], done));
    });


    it('collects no connections', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'No', jurisdictionRespondentResidence: 'No' })
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'No', jurisdictionRespondentDomicile: 'No' }))
        .then(completePage(s.steps.JurisdictionLastHabitualResidence, { jurisdictionLastHabitualResident: 'No' }))
        .then(location => {
          expect(location).to.equal(s.steps.ExitNoConnections.url);
        })
        .then(() => {
          return postData(
            agent,
            s.steps.JurisdictionLastResort.url,
            { jurisdictionLastResort: [] }
          );
        })

        .then(expectConnections([], done));
    });
  });


  describe('Jurisdiction Connections are collected correctly for same sex couples', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        marriageIsSameSexCouple: 'Yes',
        jurisdictionConnection: [],
        jurisdictionPath: []
      };
      withSession(done, agent, session);
    });


    it('collects connections G (same sex)', done => {
      postData(agent, s.steps.JurisdictionHabitualResidence.url, { jurisdictionPetitionerResidence: 'No', jurisdictionRespondentResidence: 'No' })
        .then(completePage(s.steps.JurisdictionDomicile, { jurisdictionPetitionerDomicile: 'No', jurisdictionRespondentDomicile: 'No' }))
        .then(completePage(s.steps.JurisdictionLastHabitualResidence, { jurisdictionLastHabitualResident: 'No' }))
        .then(completePage(s.steps.JurisdictionResidual, { residualJurisdictionEligible: 'Yes' }))
        .then(completePage(s.steps.JurisdictionConnectionSummary, { connectionSummary: 'Yes' }))

        .then(expectConnections(['G'], done));
    });
  });
});

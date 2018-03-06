const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/jurisdiction/last-12-months';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.JurisdictionLast12Months;
  });


  afterEach(() => {
    s.http.close();
    idamMock.restore();
  });


  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'both',
        jurisdictionDomicile: 'both',
        jurisdictionLast12Months: 'Yes'
      };
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


  describe('Last 12 months routing for habitual residence both, domicile both', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'both',
        jurisdictionDomicile: 'both',
        jurisdictionPath: ['JurisdictionLast12Months']
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both domicile', done => {
      const context = { jurisdictionLast12Months: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for petitioner domicile', done => {
      const context = { jurisdictionLast12Months: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLast6Months);
    });
  });

  describe('Last 12 months routing for habitual residence: both, domicile: petitioner', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'both',
        jurisdictionDomicile: 'petitioner',
        jurisdictionPath: ['JurisdictionLast12Months']
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both domicile', done => {
      const context = { jurisdictionLast12Months: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for petitioner domicile', done => {
      const context = { jurisdictionLast12Months: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLast6Months);
    });
  });

  describe('Last 12 months routing for habitual residence: both, domicile: respondent', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'both',
        jurisdictionDomicile: 'respondent',
        jurisdictionPath: ['JurisdictionLast12Months']
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both domicile', done => {
      const context = { jurisdictionLast12Months: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for petitioner domicile', done => {
      const context = { jurisdictionLast12Months: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });
  });

  describe('Last 12 months routing for habitual residence: both, domicile: neither', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'both',
        jurisdictionDomicile: 'neither',
        jurisdictionPath: ['JurisdictionLast12Months']
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both domicile', done => {
      const context = { jurisdictionLast12Months: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for petitioner domicile', done => {
      const context = { jurisdictionLast12Months: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });
  });

  describe('Last 12 months routing for habitual residence: petitioner, domicile: both', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'petitioner',
        jurisdictionDomicile: 'both',
        jurisdictionPath: ['JurisdictionLast12Months']
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both domicile', done => {
      const context = { jurisdictionLast12Months: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for petitioner domicile', done => {
      const context = { jurisdictionLast12Months: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLast6Months);
    });
  });

  describe('Last 12 months routing for habitual residence: petitioner, domicile: petitioner', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'petitioner',
        jurisdictionDomicile: 'petitioner',
        jurisdictionPath: ['JurisdictionLast12Months']
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both domicile', done => {
      const context = { jurisdictionLast12Months: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for petitioner domicile', done => {
      const context = { jurisdictionLast12Months: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLast6Months);
    });
  });

  describe('Last 12 months routing for habitual residence: petitioner, domicile: respondent', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'petitioner',
        jurisdictionDomicile: 'respondent',
        jurisdictionPath: ['JurisdictionLast12Months']
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both domicile', done => {
      const context = { jurisdictionLast12Months: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for petitioner domicile', done => {
      const context = { jurisdictionLast12Months: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.LastResort);
    });
  });

  describe('Last 12 months routing for habitual residence: petitioner, domicile: neither', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'petitioner',
        jurisdictionDomicile: 'neither',
        jurisdictionPath: ['JurisdictionLast12Months']
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both domicile', done => {
      const context = { jurisdictionLast12Months: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for petitioner domicile', done => {
      const context = { jurisdictionLast12Months: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.LastResort);
    });
  });

  describe('Watched session values', () => {
    it('removes jurisdictionLast12Months if jurisdictionResidence equals respondent', () => {
      const previousSession = {
        jurisdictionLast12Months: 'Yes',
        jurisdictionResidence: 'both'
      };

      const session = clone(previousSession);
      session.jurisdictionResidence = 'respondent';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.jurisdictionLast12Months).to.equal('undefined');
    });

    it('removes jurisdictionLast12Months if jurisdictionResidence equals neither', () => {
      const previousSession = {
        jurisdictionLast12Months: 'Yes',
        jurisdictionResidence: 'both'
      };

      const session = clone(previousSession);
      session.jurisdictionResidence = 'neither';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.jurisdictionLast12Months).to.equal('undefined');
    });

    it('does not remove jurisdictionLast12Months if jurisdictionResidence equals both', () => {
      const previousSession = {
        jurisdictionLast12Months: 'Yes',
        jurisdictionResidence: 'respondent'
      };

      const session = clone(previousSession);
      session.jurisdictionResidence = 'both';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.jurisdictionLast12Months)
        .to.equal(previousSession.jurisdictionLast12Months);
    });

    it('does not remove jurisdictionLast12Months if jurisdictionResidence equals petitioner', () => {
      const previousSession = {
        jurisdictionLast12Months: 'Yes',
        jurisdictionResidence: 'both'
      };

      const session = clone(previousSession);
      session.jurisdictionResidence = 'petitioner';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.jurisdictionLast12Months)
        .to.equal(previousSession.jurisdictionLast12Months);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders jurisdictionLast12Months if yes', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['jurisdictionLast12Months'];

      const context = { jurisdictionLast12Months: 'Yes' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders jurisdictionLast12Months if no', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['jurisdictionLast12Months'];

      const context = { jurisdictionLast12Months: 'No' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

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

const modulePath = 'app/steps/jurisdiction/last-6-months';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.JurisdictionLast6Months;
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
        jurisdictionResidence: 'petitioner',
        jurisdictionDomicile: 'petitioner',
        jurisdictionLast12Months: 'No',
        jurisdictionLast6Months: 'Yes'
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


  describe('Last 6 months routing for habitual residence: petitioner, domicile: petitioner', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'petitioner',
        jurisdictionDomicile: 'petitioner',
        jurisdictionLast12Months: 'No',
        jurisdictionPath: ['JurisdictionLast12Months', 'JurisdictionLast6Months']
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both domicile', done => {
      const context = { jurisdictionLast6Months: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for petitioner domicile', done => {
      const context = { jurisdictionLast6Months: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.LastResort);
    });
  });
  describe('Last 6 months routing for habitual residence: petitioner, domicile: both', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'petitioner',
        jurisdictionDomicile: 'both',
        jurisdictionLast12Months: 'No',
        jurisdictionPath: ['JurisdictionLast12Months', 'JurisdictionLast6Months']
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both domicile', done => {
      const context = { jurisdictionLast6Months: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for petitioner domicile', done => {
      const context = { jurisdictionLast6Months: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });
  });

  describe('Last 6 months routing for habitual residence: both, domicile: petitioner', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'both',
        jurisdictionDomicile: 'petitioner',
        jurisdictionLast12Months: 'No',
        jurisdictionPath: ['JurisdictionLast12Months', 'JurisdictionLast6Months']
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both domicile', done => {
      const context = { jurisdictionLast6Months: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for petitioner domicile', done => {
      const context = { jurisdictionLast6Months: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });
  });

  describe('Last 6 months routing for habitual residence: both, domicile: both', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'both',
        jurisdictionDomicile: 'both',
        jurisdictionLast12Months: 'No',
        jurisdictionPath: ['JurisdictionLast12Months', 'JurisdictionLast6Months']
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both domicile', done => {
      const context = { jurisdictionLast6Months: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for petitioner domicile', done => {
      const context = { jurisdictionLast6Months: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });
  });

  describe('Watched session values', () => {
    it('removes jurisdictionLast6Months if jurisdictionResidence equals respondent', () => {
      const previousSession = {
        jurisdictionLast6Months: 'Yes',
        jurisdictionResidence: 'both'
      };

      const session = clone(previousSession);
      session.jurisdictionResidence = 'respondent';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.jurisdictionLast6Months).to.equal('undefined');
    });

    it('removes jurisdictionLast6Months if jurisdictionResidence equals neither', () => {
      const previousSession = {
        jurisdictionLast6Months: 'Yes',
        jurisdictionResidence: 'both'
      };

      const session = clone(previousSession);
      session.jurisdictionResidence = 'neither';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.jurisdictionLast6Months).to.equal('undefined');
    });

    it('does not remove jurisdictionLast6Months if jurisdictionResidence equals both', () => {
      const previousSession = {
        jurisdictionLast6Months: 'Yes',
        jurisdictionResidence: 'respondent'
      };

      const session = clone(previousSession);
      session.jurisdictionResidence = 'both';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.jurisdictionLast6Months)
        .to.equal(previousSession.jurisdictionLast6Months);
    });

    it('does not remove jurisdictionLast6Months if jurisdictionResidence equals petitioner', () => {
      const previousSession = {
        jurisdictionLast6Months: 'Yes',
        jurisdictionResidence: 'both'
      };

      const session = clone(previousSession);
      session.jurisdictionResidence = 'petitioner';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.jurisdictionLast6Months)
        .to.equal(previousSession.jurisdictionLast6Months);
    });

    it('removes jurisdictionLast6Months if jurisdictionDomicile equals respondent', () => {
      const previousSession = {
        jurisdictionLast6Months: 'Yes',
        jurisdictionDomicile: 'both'
      };

      const session = clone(previousSession);
      session.jurisdictionDomicile = 'respondent';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.jurisdictionLast6Months).to.equal('undefined');
    });

    it('removes jurisdictionLast6Months if jurisdictionDomicile equals neither', () => {
      const previousSession = {
        jurisdictionLast6Months: 'Yes',
        jurisdictionDomicile: 'both'
      };

      const session = clone(previousSession);
      session.jurisdictionDomicile = 'neither';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.jurisdictionLast6Months).to.equal('undefined');
    });

    it('does not remove jurisdictionLast6Months if jurisdictionDomicile equals both', () => {
      const previousSession = {
        jurisdictionLast6Months: 'Yes',
        jurisdictionDomicile: 'respondent'
      };

      const session = clone(previousSession);
      session.jurisdictionDomicile = 'both';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.jurisdictionLast6Months)
        .to.equal(previousSession.jurisdictionLast6Months);
    });

    it('does not remove jurisdictionLast6Months if jurisdictionDomicile equals petitioner', () => {
      const previousSession = {
        jurisdictionLast6Months: 'Yes',
        jurisdictionDomicile: 'both'
      };

      const session = clone(previousSession);
      session.jurisdictionDomicile = 'petitioner';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.jurisdictionLast6Months)
        .to.equal(previousSession.jurisdictionLast6Months);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders jurisdictionLast6Months if yes', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['jurisdictionLast6Months'];

      const context = { jurisdictionLast6Months: 'Yes' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders jurisdictionLast6Months if no', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['jurisdictionLast6Months'];

      const context = { jurisdictionLast6Months: 'No' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

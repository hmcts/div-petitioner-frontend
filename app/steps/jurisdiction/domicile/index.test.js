const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');

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
    s.http.close();
    idamMock.restore();
  });


  describe('Domicile step content', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'both',
        jurisdictionDomicile: 'both'
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });
  });

  describe('Domicile step errors', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'both'
      };
      withSession(done, agent, session);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });
  });

  describe('Domicile routing for habitual residence: both', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'both',
        jurisdictionPath: ['JurisdictionResidence']
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both domicile', done => {
      const context = { jurisdictionDomicile: 'both' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLast12Months);
    });

    it('redirects to the next page for petitioner domicile', done => {
      const context = { jurisdictionDomicile: 'petitioner' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLast12Months);
    });

    it('redirects to the next page for respondent domicile', done => {
      const context = { jurisdictionDomicile: 'respondent' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLast12Months);
    });

    it('redirects to the next page for neither domicile', done => {
      const context = { jurisdictionDomicile: 'neither' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLast12Months);
    });
  });

  describe('Domicile routing for habitual residence: petitioner', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'petitioner',
        jurisdictionPath: ['JurisdictionResidence']
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both domicile', done => {
      const context = { jurisdictionDomicile: 'both' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLast12Months);
    });

    it('redirects to the next page for petitioner domicile', done => {
      const context = { jurisdictionDomicile: 'petitioner' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLast12Months);
    });

    it('redirects to the next page for respondent domicile', done => {
      const context = { jurisdictionDomicile: 'respondent' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLast12Months);
    });

    it('redirects to the next page for neither domicile', done => {
      const context = { jurisdictionDomicile: 'neither' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLast12Months);
    });
  });

  describe('Domicile routing for habitual residence: respondent', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'respondent',
        jurisdictionPath: ['JurisdictionResidence']
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both domicile', done => {
      const context = { jurisdictionDomicile: 'both' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for petitioner domicile', done => {
      const context = { jurisdictionDomicile: 'petitioner' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for respondent domicile', done => {
      const context = { jurisdictionDomicile: 'respondent' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for neither domicile', done => {
      const context = { jurisdictionDomicile: 'neither' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });
  });

  describe('Domicile routing for habitual residence: neither', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionResidence: 'neither',
        jurisdictionPath: ['JurisdictionResidence']
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for both domicile', done => {
      const context = { jurisdictionDomicile: 'both' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for petitioner domicile', done => {
      const context = { jurisdictionDomicile: 'petitioner' };

      testRedirect(done, agent, underTest, context, s.steps.LastResort);
    });

    it('redirects to the next page for respondent domicile', done => {
      const context = { jurisdictionDomicile: 'respondent' };

      testRedirect(done, agent, underTest, context, s.steps.LastResort);
    });

    it('redirects to the next page for neither domicile', done => {
      const context = { jurisdictionDomicile: 'neither' };

      testRedirect(done, agent, underTest, context, s.steps.LastResort);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders jurisdiction domicile both', done => {
      const contentToExist = [
        'question',
        'both'
      ];

      const valuesToExist = [];

      const context = {
        jurisdictionDomicile: 'both',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders jurisdiction domicile petitioner', done => {
      const contentToExist = [
        'question',
        'petitioner'
      ];

      const valuesToExist = [];

      const context = {
        jurisdictionDomicile: 'petitioner',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders jurisdiction domicile respondent', done => {
      const contentToExist = [
        'question',
        'respondent'
      ];

      const valuesToExist = [];

      const context = {
        jurisdictionDomicile: 'respondent',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders jurisdiction domicile neither', done => {
      const contentToExist = [
        'question',
        'neither'
      ];

      const valuesToExist = [];

      const context = {
        jurisdictionDomicile: 'neither',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

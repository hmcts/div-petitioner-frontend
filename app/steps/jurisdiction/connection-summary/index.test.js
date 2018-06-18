const request = require('supertest');
const { merge } = require('lodash');
const {
  testContent, testErrors, testRedirect,
  testNoneExistenceCYA, testExistenceCYA
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const contentJurisdiction = require('app/content/commonJurisdiction');

const modulePath = 'app/steps/jurisdiction/connection-summary';

const content = require(`${modulePath}/content`);
const cyaContent = require('app/services/jurisdiction/content');

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.JurisdictionConnectionSummary;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('JurisdictionConnectionSummary step content for connection A', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPath: ['JurisdictionHabitualResidence'],
        jurisdictionConnection: ['A']
      };
      withSession(done, agent, session);
      content.resources.en.translation.content = merge(
        content.resources.en.translation.content,
        contentJurisdiction.resources.en.translation
      );
    });

    it('renders the content from the content file for A', done => {
      // we are excluding these keys as the content changes based on the last connection. In this case jurisdictionConnection is ['A']
      const excludeKeys = ['reason-B', 'reason-C', 'reason-D', 'reason-E', 'reason-F', 'reason-G', 'connectionSummaryTitle'];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });

  describe('Connection step content for connection B (last habitual residence)', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPath: ['JurisdictionLastHabitualResidence'],
        jurisdictionConnection: ['B']
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file for B', done => {
      // we are excluding these keys as the content changes based on the last connection. In this case jurisdictionConnection is ['A']
      const excludeKeys = ['reason-A', 'reason-C', 'reason-D', 'reason-E', 'reason-F', 'reason-G', 'connectionSummaryTitle'];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });


  describe('JurisdictionConnectionSummary step content for connection F (both domiciled)', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPath: ['JurisdictionHabitualResidence'],
        jurisdictionConnection: ['A', 'C', 'D', 'F']
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file for C', done => {
      // we are excluding these keys as the content changes based on the last connection. In this case jurisdictionConnection is ['A']
      const excludeKeys = ['reason-B', 'reason-E', 'reason-G', 'connectionSummaryTitle'];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });

  describe('JurisdictionConnectionSummary step content for connection E (both domiciled)', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPath: ['JurisdictionHabitualResidence'],
        jurisdictionConnection: ['A', 'C', 'D', 'E']
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file for C', done => {
      // we are excluding these keys as the content changes based on the last connection. In this case jurisdictionConnection is ['A']
      const excludeKeys = ['reason-B', 'reason-F', 'reason-G', 'connectionSummaryTitle'];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });

  describe('JurisdictionConnectionSummary step errors', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPath: ['JurisdictionHabitualResidence']
      };
      withSession(done, agent, session);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });
  });

  describe('JurisdictionConnectionSummary routing ', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionConnection: ['A']
      };
      withSession(done, agent, session);
    });

    it('redirects to the petitioner details page when confident legal connections', done => {
      const context = { connectionSummary: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the habitually resident when unsure', done => {
      const context = { connectionSummary: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionHabitualResidence);
    });
  });

  describe('Check Your Answers', () => {
    it('renders legalCheckYourAnswersTemplate.html if connectionSummary is yes', done => {
      const contentToExist = ['how-your-connected'];

      const valuesToExist = [];

      const context = { connectionSummary: 'Yes' };

      const session = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, cyaContent,
        contentToExist, valuesToExist, context, session);
    });

    it('does not render legalCheckYourAnswersTemplate.html if connectionSummary is no', done => {
      const contentToNotExist = ['how-your-connected'];

      const valuesToNotExist = [];

      const context = { connectionSummary: 'No' };

      const session = { divorceWho: 'wife' };

      testNoneExistenceCYA(done, underTest, cyaContent,
        contentToNotExist, valuesToNotExist, context, session);
    });

    describe('jurisdiction legal CYA template', () => {
      it('renders all connection content', done => {
        const contentToExist = [
          'connectionA',
          'connectionB',
          'connectionC',
          'connectionD',
          'connectionE',
          'connectionF',
          'connectionG'
        ];

        const valuesToExist = [];

        const context = { connectionSummary: 'Yes' };

        const session = {
          divorceWho: 'wife',
          connections: {
            A: 'connection text',
            B: 'connection text',
            C: 'connection text',
            D: 'connection text',
            E: 'connection text',
            F: 'connection text',
            G: 'connection text'
          }
        };

        testExistenceCYA(done, underTest, content,
          contentToExist, valuesToExist, context, session);
      });

      it('renders the see your legal connections link', done => {
        const contentToExist = ['see-you-legal-connections'];

        const context = { connectionSummary: 'Yes' };

        testExistenceCYA(done, underTest, content, contentToExist, [], context);
      });

      it('renders the legal content for the connections', done => {
        const contentToExist = [
          'legalA',
          'legalB',
          'legalC',
          'legalD',
          'legalE',
          'legalF',
          'legalG'
        ];

        const valuesToExist = [];

        const context = { connectionSummary: 'Yes' };

        const session = {
          divorceWho: 'wife',
          connections: {
            A: 'connection text',
            B: 'connection text',
            C: 'connection text',
            D: 'connection text',
            E: 'connection text',
            F: 'connection text',
            G: 'connection text'
          }
        };

        testExistenceCYA(done, underTest, content,
          contentToExist, valuesToExist, context, session);
      });
    });
  });
});

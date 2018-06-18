const request = require('supertest');
const { testContent, testRedirect, testExistenceCYA } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone, merge } = require('lodash');

const modulePath = 'app/steps/jurisdiction/last-resort';
const content = require(`${modulePath}/content`);
const contentJurisdiction = require('app/content/commonJurisdiction');
const contentCYA = require('app/services/jurisdiction/content');

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.JurisdictionLastResort;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('content', () => {
    describe('Last resort screen', () => {
      let session = {};

      beforeEach(done => {
        session = { divorceWho: 'wife' };
        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        content.resources.en.translation.content = merge(
          content.resources.en.translation.content,
          contentJurisdiction.resources.en.translation
        );

        testContent(done, agent, underTest, content, session);
      });

      it('renders the content from the CYA content file', done => {
        const excludeKeys = [
          'how-your-connected',
          'see-you-legal-connections',
          'connections',
          'legalA',
          'legalB',
          'legalC',
          'legalD',
          'legalF',
          'legalE',
          'legalG'
        ];

        testContent(done, agent, underTest, contentCYA, session, excludeKeys);
      });
    });
  });
  describe('Last resort routing', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPath: [
          'JurisdictionResidence',
          'JurisdictionDomicile'
        ]
      };
      withSession(done, agent, session);
    });

    it('redirects to the next page for single selection', done => {
      const context = { jurisdictionLastResortConnections: ['C'] };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for multiple selection', done => {
      const context = { jurisdictionLastResortConnections: ['C', 'A', 'E'] };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the exit screen when nothing selected', done => {
      const context = {};

      testRedirect(done, agent, underTest, context, s.steps.ExitJurisdiction);
    });
  });

  describe('Watched session values', () => {
    it('removes jurisdictionLastResort if jurisdictionDomicile changes', () => {
      const previousSession = {
        jurisdictionLastResort: ['some', 'last', 'resort', 'answers'],
        jurisdictionDomicile: 'neither'
      };

      const session = clone(previousSession);
      session.jurisdictionDomicile = 'both';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.jurisdictionLastResort).to.equal('undefined');
    });

    it('removes jurisdictionLastResort if jurisdictionResidence changes', () => {
      const previousSession = {
        jurisdictionLastResort: ['some', 'last', 'resort', 'answers'],
        jurisdictionResidence: 'neither'
      };

      const session = clone(previousSession);
      session.jurisdictionResidence = 'both';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.jurisdictionLastResort).to.equal('undefined');
    });

    it('removes jurisdictionLastResort if jurisdictionLast6Months changes', () => {
      const previousSession = {
        jurisdictionLastResort: ['some', 'last', 'resort', 'answers'],
        jurisdictionLast6Months: 'Yes'
      };

      const session = clone(previousSession);
      session.jurisdictionLast6Months = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.jurisdictionLastResort).to.equal('undefined');
    });

    it('removes jurisdictionLastResort if jurisdictionLast12Months changes', () => {
      const previousSession = {
        jurisdictionLastResort: ['some', 'last', 'resort', 'answers'],
        jurisdictionLast12Months: 'Yes'
      };

      const session = clone(previousSession);
      session.jurisdictionLast12Months = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.jurisdictionLastResort).to.equal('undefined');
    });

    it('doese not remove jurisdictionLastResort if jurisdictionDomicile does not change', () => {
      const previousSession = {
        jurisdictionLastResort: ['some', 'last', 'resort', 'answers'],
        jurisdictionDomicile: 'neither'
      };

      const session = clone(previousSession);
      session.jurisdictionDomicile = 'neither';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.jurisdictionLastResort)
        .to.equal(previousSession.jurisdictionLastResort);
    });

    it('doese not remove jurisdictionLastResort if jurisdictionResidence does not change', () => {
      const previousSession = {
        jurisdictionLastResort: ['some', 'last', 'resort', 'answers'],
        jurisdictionResidence: 'neither'
      };

      const session = clone(previousSession);
      session.jurisdictionResidence = 'neither';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.jurisdictionLastResort)
        .to.equal(previousSession.jurisdictionLastResort);
    });

    it('doese not remove jurisdictionLastResort if jurisdictionLast6Months does not change', () => {
      const previousSession = {
        jurisdictionLastResort: ['some', 'last', 'resort', 'answers'],
        jurisdictionLast6Months: 'Yes'
      };

      const session = clone(previousSession);
      session.jurisdictionLast6Months = 'Yes';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.jurisdictionLastResort)
        .to.equal(previousSession.jurisdictionLastResort);
    });

    it('doese not remove jurisdictionLastResort if jurisdictionLast12Months does not change', () => {
      const previousSession = {
        jurisdictionLastResort: ['some', 'last', 'resort', 'answers'],
        jurisdictionLast12Months: 'Yes'
      };

      const session = clone(previousSession);
      session.jurisdictionLast12Months = 'Yes';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.jurisdictionLastResort)
        .to.equal(previousSession.jurisdictionLastResort);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the how-your-connected title', done => {
      const contentToExist = ['how-your-connected'];

      const context = { jurisdictionConfidentLegal: 'Yes' };

      testExistenceCYA(done, underTest, content, contentToExist, [], context);
    });

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

      const context = { jurisdictionConfidentLegal: 'Yes' };

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

      const context = { jurisdictionConfidentLegal: 'Yes' };

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

      const context = { jurisdictionConfidentLegal: 'Yes' };

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

const request = require('supertest');
const { testContent, testCYATemplate, testExistenceCYA, testRedirect } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/jurisdiction/last-resort';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.LastResort;
  });


  afterEach(() => {
    s.http.close();
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
        testContent(done, agent, underTest, content, session);
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
      const context = { jurisdictionLastResort: ['respondentResident'] };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for multiple selection', done => {
      const context = { jurisdictionLastResort: ['respondentResident', 'bothResident', 'petitionerResidentAndDomiciled'] };

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
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders all last resort options', done => {
      const contentToExist = [
        'question',
        'bothResident',
        'oneOfResident',
        'respondentResident',
        'petitionerResident',
        'petitionerResidentAndDomiciled',
        'bothDomiciled'
      ];

      const valuesToExist = [];

      const context = {
        jurisdictionLastResort: [
          'bothResident',
          'oneOfResident',
          'respondentResident',
          'petitionerResident',
          'petitionerResidentAndDomiciled',
          'bothDomiciled'
        ],
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders bothResident last resort option', done => {
      const contentToExist = [
        'question',
        'bothResident'
      ];

      const valuesToExist = [];

      const context = {
        jurisdictionLastResort: ['bothResident'],
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders oneOfResident last resort option', done => {
      const contentToExist = [
        'question',
        'oneOfResident'
      ];

      const valuesToExist = [];

      const context = {
        jurisdictionLastResort: ['oneOfResident'],
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders respondentResident last resort option', done => {
      const contentToExist = [
        'question',
        'respondentResident'
      ];

      const valuesToExist = [];

      const context = {
        jurisdictionLastResort: ['respondentResident'],
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders petitionerResident last resort option', done => {
      const contentToExist = [
        'question',
        'petitionerResident'
      ];

      const valuesToExist = [];

      const context = {
        jurisdictionLastResort: ['petitionerResident'],
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders petitionerResidentAndDomiciled last resort option', done => {
      const contentToExist = [
        'question',
        'petitionerResidentAndDomiciled'
      ];

      const valuesToExist = [];

      const context = {
        jurisdictionLastResort: ['petitionerResidentAndDomiciled'],
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders bothDomiciled last resort option', done => {
      const contentToExist = [
        'question',
        'bothDomiciled'
      ];

      const valuesToExist = [];

      const context = {
        jurisdictionLastResort: ['bothDomiciled'],
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

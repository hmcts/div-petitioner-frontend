const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const moment = require('moment');
const server = require('app');
const { clone } = require('lodash');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { checkMarriageDate } = require('app/middleware/checkMarriageDateMiddleware');

const modulePath = 'app/steps/grounds-for-divorce/reason';

const content = require(`${modulePath}/content`);

const ONE_AND_HALF_YEARS = 1.5;
const THREE_YEARS = 3;
const SIX_YEARS = 6;
const ELEVEN_MONTHS = 11;
const EIGHTEEN_MONTHS = 18;

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.ReasonForDivorce;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('#middleware', () => {
    it('includes checkMarriageDate in middleware', () => {
      expect(underTest.middleware
        .includes(checkMarriageDate))
        .to.eql(true);
    });
  });

  describe('error messages', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        marriageDate: '2000-01-01T00:00:00.000Z'
      };
      withSession(done, agent, session);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });
  });

  describe('valid context', () => {
    let session = {};

    beforeEach(done => {
      session = { marriageDate: '2000-01-01T00:00:00.000Z' };
      withSession(done, agent, session);
    });

    it('redirects to the unreasonable behaviour page when unreasonable-behaviour is selected', done => {
      const context = { reasonForDivorce: 'unreasonable-behaviour' };
      testRedirect(done, agent, underTest, context,
        s.steps.UnreasonableBehaviour, session);
    });

    it('redirects to the adultery wish to name page when adultery is selected', done => {
      const context = { reasonForDivorce: 'adultery' };
      testRedirect(done, agent, underTest, context, s.steps.AdulteryWishToName);
    });

    it('redirects to the desertion date page when desertion is selected', done => {
      const context = { reasonForDivorce: 'desertion' };
      testRedirect(done, agent, underTest, context, s.steps.DesertionAgree);
    });

    it('redirects to the respondent consent page when 2 year separation is selected', done => {
      const context = { reasonForDivorce: 'separation-2-years' };

      testRedirect(done, agent, underTest, context, s.steps.RespondentConsent);
    });

    it('redirects to the new separation date page when 5 year separation is selected', done => {
      const context = { reasonForDivorce: 'separation-5-years' };
      testRedirect(done, agent, underTest, context, s.steps.SeparationDateNew);
    });
  });

  describe('content', () => {
    describe('married more than 1 year but less than two', () => {
      let session = {};

      beforeEach(done => {
        const marriageDateMoreThan1Year = moment().subtract(ONE_AND_HALF_YEARS, 'years');

        session = {
          divorceWho: 'wife',
          marriageDate: marriageDateMoreThan1Year.toISOString()
        };
        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        const excludeKeys = [
          'woman',
          'hasNoMarriageDate',
          'separatedDetails',
          'sameResidenceHeading',
          'sameResidenceSummary',
          'asACoupleHeading',
          'asACoupleSummary1',
          'asACoupleSummary2',
          'asACoupleSummary3',
          '2Years',
          '5Years',
          '2YearsSeparationSummary',
          '2YearsSeparationWarning',
          '5YearsSeparationSummary',
          '5YearsSeparationWarning',
          'desertionSummary'
        ];

        testContent(done, agent, underTest, content, session, excludeKeys);
      });
    });


    describe('married more than 2 years but less than five', () => {
      let session = {};

      beforeEach(done => {
        const marriageDateMoreThan2Year = moment().subtract(THREE_YEARS, 'years');

        session = {
          divorceWho: 'wife',
          marriageDate: marriageDateMoreThan2Year.toISOString()
        };
        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        const excludeKeys = [
          'woman',
          'hasNoMarriageDate',
          'separatedDetails',
          '2YearsSeparationExclusion',
          '5Years',
          '5YearsSeparationSummary',
          '5YearsSeparationWarning',
          'desertionExclusion'
        ];

        testContent(done, agent, underTest, content, session, excludeKeys);
      });
    });

    describe('married for more than 5 years', () => {
      let session = {};

      beforeEach(done => {
        const marriageDateMoreThan5Year = moment().subtract(SIX_YEARS, 'years');

        session = {
          divorceWho: 'wife',
          marriageDate: marriageDateMoreThan5Year.toISOString()
        };
        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        const excludeKeys = [
          'woman',
          'alternativelyInFuture',
          'hasNoMarriageDate',
          '2YearsSeparationExclusion',
          '5YearsSeparationExclusion',
          'desertionExclusion'
        ];

        testContent(done, agent, underTest, content, session, excludeKeys);
      });
    });
  });

  describe('Watched session values', () => {
    it('removes reasonForDivorce if marriageDate is less than a year', () => {
      const previousSession = {
        marriageDate: moment().subtract(SIX_YEARS, 'years')
          .toDate(),
        reasonForDivorce: 'Anything'
      };

      const session = clone(previousSession);
      session.marriageDate = moment().subtract(ELEVEN_MONTHS, 'months')
        .toDate();

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.reasonForDivorce).to.equal('undefined');
    });

    it('removes reasonForDivorce if marriageDate between 1 and 2 years and reasonForDivorce is separation-2-years', () => {
      const previousSession = {
        marriageDate: moment().subtract(SIX_YEARS, 'years')
          .toDate(),
        reasonForDivorce: 'separation-2-years'
      };

      const session = clone(previousSession);
      session.marriageDate = moment().subtract(EIGHTEEN_MONTHS, 'months')
        .toDate();

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.reasonForDivorce).to.equal('undefined');
    });

    it('removes reasonForDivorce if marriageDate between 1 and 2 years and reasonForDivorce is separation-5-years', () => {
      const previousSession = {
        marriageDate: moment().subtract(SIX_YEARS, 'years')
          .toDate(),
        reasonForDivorce: 'separation-5-years'
      };

      const session = clone(previousSession);
      session.marriageDate = moment().subtract(EIGHTEEN_MONTHS, 'months')
        .toDate();

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.reasonForDivorce).to.equal('undefined');
    });

    it('removes reasonForDivorce if marriageDate between 1 and 2 years and reasonForDivorce is desertion', () => {
      const previousSession = {
        marriageDate: moment().subtract(SIX_YEARS, 'years')
          .toDate(),
        reasonForDivorce: 'desertion'
      };

      const session = clone(previousSession);
      session.marriageDate = moment().subtract(EIGHTEEN_MONTHS, 'months')
        .toDate();

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.reasonForDivorce).to.equal('undefined');
    });

    it('removes reasonForDivorce if marriageDate between 2 and 5 years and reasonForDivorce is separation-5-years', () => {
      const previousSession = {
        marriageDate: moment().subtract(SIX_YEARS, 'years')
          .toDate(),
        reasonForDivorce: 'separation-5-years'
      };

      const session = clone(previousSession);
      session.marriageDate = moment().subtract(THREE_YEARS, 'years')
        .toDate();

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.reasonForDivorce).to.equal('undefined');
    });

    it('does not remove reasonForDivorce if marriageDate more than 5 years', () => {
      const previousSession = {
        marriageDate: moment().subtract(THREE_YEARS, 'years')
          .toDate(),
        reasonForDivorce: 'separation-5-years'
      };

      const session = clone(previousSession);
      session.marriageDate = moment().subtract(SIX_YEARS, 'years')
        .toDate();

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.reasonForDivorce)
        .to.equal(previousSession.reasonForDivorce);
    });

    it('does not remove reasonForDivorce if reasonForDivorce is adultery', () => {
      const previousSession = {
        marriageDate: moment().subtract(THREE_YEARS, 'years')
          .toDate(),
        reasonForDivorce: 'adultery'
      };

      const session = clone(previousSession);
      session.marriageDate = moment().subtract(EIGHTEEN_MONTHS, 'months')
        .toDate();

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.reasonForDivorce)
        .to.equal(previousSession.reasonForDivorce);
    });

    it('does not remove reasonForDivorce if reasonForDivorce is unreasonable-behaviour', () => {
      const previousSession = {
        marriageDate: moment().subtract(THREE_YEARS, 'years')
          .toDate(),
        reasonForDivorce: 'unreasonable-behaviour'
      };

      const session = clone(previousSession);
      session.marriageDate = moment().subtract(EIGHTEEN_MONTHS, 'months')
        .toDate();

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.reasonForDivorce)
        .to.equal(previousSession.reasonForDivorce);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders reason for divorce unreasonable-behaviour', done => {
      const contentToExist = [
        'question',
        'unreasonableBehaviourHeading'
      ];

      const valuesToExist = [];

      const context = { reasonForDivorce: 'unreasonable-behaviour' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders reason for divorce adultery', done => {
      const contentToExist = [
        'question',
        'adulteryHeading'
      ];

      const valuesToExist = [];

      const context = { reasonForDivorce: 'adultery' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders reason for divorce separation-2-years', done => {
      const contentToExist = [
        'question',
        '2YearsSeparationHeading'
      ];

      const valuesToExist = [];

      const context = { reasonForDivorce: 'separation-2-years' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders reason for divorce separation-5-years', done => {
      const contentToExist = [
        'question',
        '5YearsSeparationHeading'
      ];

      const valuesToExist = [];

      const context = { reasonForDivorce: 'separation-5-years' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders reason for divorce desertion', done => {
      const contentToExist = [
        'question',
        'desertionHeading'
      ];

      const valuesToExist = [];

      const context = { reasonForDivorce: 'desertion' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });

  describe('if previousReasonForDivorce is unreasonable-behaviour', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        marriageDate: '2000-01-01T00:00:00.000Z',
        previousReasonsForDivorce: ['unreasonable-behaviour']
      };
      withSession(done, agent, session);
    });

    it('Remove unreasonable-behaviour from reasonForDivorce', done => {
      const excludeKeys = [
        'woman',
        'hasNoMarriageDate',
        '2YearsSeparationExclusion',
        '5YearsSeparationExclusion',
        'desertionExclusion',
        'alternativelyInFuture',
        'unreasonableBehaviourSummary',
        'unreasonableBehaviourHeading',
        'unreasonableBehaviourWarning'
      ];


      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });

  describe('if previousReasonForDivorce is desertion', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        marriageDate: '2000-01-01T00:00:00.000Z',
        previousReasonsForDivorce: ['desertion']
      };
      withSession(done, agent, session);
    });

    it('Remove desertion from reasonForDivorce', done => {
      const excludeKeys = [
        'woman',
        'hasNoMarriageDate',
        '2YearsSeparationExclusion',
        '5YearsSeparationExclusion',
        'desertionSummary',
        'desertionExclusion',
        'alternativelyInFuture'
      ];


      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });

  describe('if previousReasonForDivorce is adultery', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        marriageDate: '2000-01-01T00:00:00.000Z',
        previousReasonsForDivorce: ['adultery']
      };
      withSession(done, agent, session);
    });

    it('Remove adultery from reasonForDivorce', done => {
      const excludeKeys = [
        'woman',
        'hasNoMarriageDate',
        'adulteryHeading',
        'adulterySummary1',
        'adulterySummary2',
        'adulteryWarning',
        '2YearsSeparationExclusion',
        '5YearsSeparationExclusion',
        'desertionExclusion',
        'alternativelyInFuture'
      ];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });


  describe('if previousReasonForDivorce is separation-2-years', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        marriageDate: '2000-01-01T00:00:00.000Z',
        previousReasonsForDivorce: ['separation-2-years']
      };
      withSession(done, agent, session);
    });

    it('Remove separation-2-years from reasonForDivorce', done => {
      const excludeKeys = [
        'woman',
        'hasNoMarriageDate',
        '2YearsSeparationHeading',
        '2YearsSeparationSummary',
        '2YearsSeparationWarning',
        '2YearsSeparationExclusion',
        '5YearsSeparationExclusion',
        'desertionExclusion',
        'alternativelyInFuture'
      ];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });

  describe('if previousReasonForDivorce is separation-5-years', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        marriageDate: '2000-01-01T00:00:00.000Z',
        previousReasonsForDivorce: ['separation-5-years']
      };
      withSession(done, agent, session);
    });

    it('Remove separation-5-years from reasonForDivorce', done => {
      const excludeKeys = [
        'woman',
        'hasNoMarriageDate',
        '5Years',
        '2YearsSeparationExclusion',
        '5YearsSeparationHeading',
        '5YearsSeparationSummary',
        '5YearsSeparationExclusion',
        'desertionExclusion',
        'alternativelyInFuture'
      ];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });


  describe('if previousReasonForDivorce is separation-5-years', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        marriageDate: '2000-01-01T00:00:00.000Z',
        previousReasonsForDivorce: ['separation-5-years', 'adultery']
      };
      withSession(done, agent, session);
    });

    it('Remove separation-5-years from reasonForDivorce', done => {
      const excludeKeys = [
        'woman',
        'hasNoMarriageDate',
        '5Years',
        '2YearsSeparationExclusion',
        '5YearsSeparationHeading',
        '5YearsSeparationSummary',
        '5YearsSeparationExclusion',
        'desertionExclusion',
        'alternativelyInFuture',
        'adulteryHeading',
        'adulterySummary1',
        'adulterySummary2',
        'adulteryWarning'
      ];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });
});

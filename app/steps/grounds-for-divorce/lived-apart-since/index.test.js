const request = require('supertest');
const {
  testContent, testRedirect, testErrors, testExistenceCYA,
  testCYATemplate, testMultipleValuesExistence
} = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');

const modulePath = 'app/steps/grounds-for-divorce/lived-apart-since';

const content = require(`${modulePath}/content`);
const { clone } = require('lodash');
const { expect } = require('test/util/chai');
const { withSession } = require('test/util/setup');
const moment = require('moment');
const timekeeper = require('timekeeper');

let s = {};
let agent = {};
let underTest = {};

const constants = {
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  ten: '10'
};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.LivedApartSince;
    timekeeper.freeze(new Date('2019-02-28T11:00:00Z'));
  });

  afterEach(() => {
    idamMock.restore();
    timekeeper.reset();
  });

  describe('Separation-5-years - render content', () => {
    let session = {};

    beforeEach(done => {
      session = {
        marriageDate: '2001-02-02T00:00:00.000Z',
        reasonForDivorce: 'separation-5-years',
        reasonForDivorceDecisionDate: moment().startOf('day')
          .subtract(constants.five, 'years')
          .subtract(constants.three, 'months'),
        reasonForDivorceLivingApartDate: moment().startOf('day')
          .subtract(constants.five, 'years')
          .subtract(constants.two, 'months')
      };
      withSession(done, agent, session);
    });

    const excludeKeys = [
      'desQues',
      'question.exactDate',
      'question.yearsAndMonths',
      'question.needNotToUse',
      'mustSpentYr',
      'onlyUpTo6Months',
      'ifMoreThan6Months',
      'ifLessThan6Months'
    ];

    it('Loads content if most recent sep date is < 5 yr 6 months', done => {
      testContent(done, agent, underTest, content, session, excludeKeys);
    });

    it('render calculated values', done => {
      const valuesToTest = [
        '8 weeks',
        '6 days',
        '62 days',
        session.reasonForDivorceLivingApartDate.format('DD MMMM YYYY')
      ];
      testMultipleValuesExistence(
        done,
        agent,
        underTest,
        valuesToTest,
        session
      );
    });
  });

  describe('Separation-5-years - render content', () => {
    let session = {};

    beforeEach(done => {
      session = {
        marriageDate: '2001-02-02T00:00:00.000Z',
        reasonForDivorce: 'separation-5-years',
        reasonForDivorceDecisionDate: moment().startOf('day')
          .subtract(constants.five, 'years')
          .subtract(constants.nine, 'months'),
        reasonForDivorceLivingApartDate: moment().startOf('day')
          .subtract(constants.five, 'years')
          .subtract(constants.eight, 'months')
      };
      withSession(done, agent, session);
    });

    it('Loads content if most recent sep date is > 5 yr 6 months', done => {
      const excludeKeys = [
        'desQues',
        'question.weeks',
        'question.days',
        'question.week',
        'question.yearsAndMonths',
        'question.needNotToUse',
        'mustSpentYr',
        'onlyUpTo6Months',
        'ifMoreThan6Months',
        'ifLessThan6Months'
      ];
      testContent(done, agent, underTest, content, session, excludeKeys);
    });

    it('render calculated values', done => {
      const valuesToTest = [
        '6 months',
        moment().startOf('day')
          .subtract(constants.five, 'years')
          .subtract(constants.six, 'months')
          .format('DD MMMM YYYY')
      ];
      testMultipleValuesExistence(
        done,
        agent,
        underTest,
        valuesToTest,
        session
      );
    });
  });

  describe('Separation-5-years - render content', () => {
    let session = {};

    beforeEach(done => {
      session = {
        marriageDate: '2001-02-02T00:00:00.000Z',
        reasonForDivorce: 'separation-5-years',
        reasonForDivorceDecisionDate: moment().startOf('day')
          .subtract(constants.five, 'years')
          .subtract(constants.six, 'months'),
        reasonForDivorceLivingApartDate: moment().startOf('day')
          .subtract(constants.five, 'years')
          .subtract(constants.seven, 'months')
      };
      withSession(done, agent, session);
    });

    const excludeKeys = [
      'desQues',
      'question.weeks',
      'question.days',
      'question.week',
      'question.yearsAndMonths',
      'question.needNotToUse',
      'mustSpentYr',
      'onlyUpTo6Months',
      'ifMoreThan6Months',
      'ifLessThan6Months'
    ];

    it('Loads content if most recent sep date is = 5 yr 6 months', done => {
      testContent(done, agent, underTest, content, session, excludeKeys);
    });

    it('render calculated values', done => {
      const valuesToTest = [
        '6 months',
        moment().startOf('day')
          .subtract(constants.five, 'years')
          .subtract(constants.six, 'months')
          .format('DD MMMM YYYY')
      ];
      testMultipleValuesExistence(
        done,
        agent,
        underTest,
        valuesToTest,
        session
      );
    });
  });

  describe('Separation-2-years - render content', () => {
    let session = {};

    beforeEach(done => {
      session = {
        marriageDate: '2001-02-02T00:00:00.000Z',
        reasonForDivorce: 'separation-2-years',
        reasonForDivorceDecisionDate: moment().startOf('day')
          .subtract(constants.two, 'years')
          .subtract(constants.three, 'months'),
        reasonForDivorceLivingApartDate: moment().startOf('day')
          .subtract(constants.two, 'years')
          .subtract(constants.four, 'months')
      };
      withSession(done, agent, session);
    });

    const excludeKeys = [
      'desQues',
      'question.exactDate',
      'question.yearsAndMonths',
      'question.needNotToUse',
      'mustSpentYr',
      'onlyUpTo6Months',
      'ifMoreThan6Months',
      'ifLessThan6Months'
    ];

    it('Loads content if most recent sep date is < 2 yr 6 months', done => {
      testContent(done, agent, underTest, content, session, excludeKeys);
    });

    it('render calculated values', done => {
      const valuesToTest = [ '13 weeks', '92 days'];
      testMultipleValuesExistence(
        done,
        agent,
        underTest,
        valuesToTest,
        session
      );
    });
  });

  describe('Separation-2-years - render content', () => {
    let session = {};

    beforeEach(done => {
      session = {
        marriageDate: '2001-02-02T00:00:00.000Z',
        reasonForDivorce: 'separation-2-years',
        reasonForDivorceDecisionDate: moment().startOf('day')
          .subtract(constants.two, 'years')
          .subtract(constants.nine, 'months'),
        reasonForDivorceLivingApartDate: moment().startOf('day')
          .subtract(constants.two, 'years')
          .subtract(constants.ten, 'months')
      };
      withSession(done, agent, session);
    });

    it('Loads content if most recent sep date is > 2 yr 6 months', done => {
      const excludeKeys = [
        'desQues',
        'question.weeks',
        'question.days',
        'question.week',
        'question.yearsAndMonths',
        'question.needNotToUse',
        'mustSpentYr',
        'onlyUpTo6Months',
        'ifMoreThan6Months',
        'ifLessThan6Months'
      ];
      testContent(done, agent, underTest, content, session, excludeKeys);
    });

    it('render calculated values', done => {
      const valuesToTest = [
        '6 months',
        moment().startOf('day')
          .subtract(constants.two, 'years')
          .subtract(constants.six, 'months')
          .format('DD MMMM YYYY')
      ];
      testMultipleValuesExistence(
        done,
        agent,
        underTest,
        valuesToTest,
        session
      );
    });
  });

  describe('Separation-2-years - render content', () => {
    let session = {};

    beforeEach(done => {
      session = {
        marriageDate: '2001-02-02T00:00:00.000Z',
        reasonForDivorce: 'separation-2-years',
        reasonForDivorceDecisionDate: moment().startOf('day')
          .subtract(constants.two, 'years')
          .subtract(constants.seven, 'months'),
        reasonForDivorceLivingApartDate: moment().startOf('day')
          .subtract(constants.two, 'years')
          .subtract(constants.six, 'months')
      };
      withSession(done, agent, session);
    });

    const excludeKeys = [
      'desQues',
      'question.weeks',
      'question.days',
      'question.week',
      'question.yearsAndMonths',
      'question.needNotToUse',
      'mustSpentYr',
      'onlyUpTo6Months',
      'ifMoreThan6Months',
      'ifLessThan6Months'
    ];

    it('Loads content if most recent sep date is = 2 yr 6 months', done => {
      testContent(done, agent, underTest, content, session, excludeKeys);
    });

    it('render calculated values', done => {
      const valuesToTest = [
        '6 months',
        moment().startOf('day')
          .subtract(constants.two, 'years')
          .subtract(constants.six, 'months')
          .format('DD MMMM YYYY')
      ];
      testMultipleValuesExistence(
        done,
        agent,
        underTest,
        valuesToTest,
        session
      );
    });
  });

  describe('redirects to the next page', () => {
    it(`Living Apart Entire time after separation date : No,
        Living Together More Than 6 Months rule : No `, done => {
      const context = {
        livedApartEntireTime: 'No',
        livedTogetherMoreTimeThanPermitted: 'No'
      };

      testRedirect(done, agent, underTest, context, s.steps.LegalProceedings);
    });

    it(`Living Apart Entire time after separation date : No,
        Living Together More Than 6 Months rule : Yes `, done => {
      const context = {
        livedApartEntireTime: 'No',
        livedTogetherMoreTimeThanPermitted: 'Yes'
      };
      testRedirect(done, agent, underTest, context, s.steps.ExitSixMonthRule);
    });

    it('Living Apart Entire time after separation date : Yes', done => {
      const context = { livedApartEntireTime: 'Yes' };

      testRedirect(done, agent, underTest, context, s.steps.LegalProceedings);
    });
  });

  describe('Test Errors on the page', () => {
    it('livedApartEntireTime : Not selected', done => {
      const context = {};
      testErrors(done, agent, underTest, context,
        content, 'livedApartEntireTime.required');
    });

    it(`livedApartEntireTime :  No ,
        livedTogetherMoreTimeThanPermitted : Not selected`, done => {
      const context = {
        livedApartEntireTime: 'No',
        livedTogetherMoreTimeThanPermitted: '',
        referenceDate: moment().startOf('day')
          .subtract(constants.five, 'years')
          .subtract(constants.six, 'months')
          .format('DD MMMM YYYY')
      };
      testErrors(done, agent, underTest, context, content, 'livedTogetherMoreTimeThanPermitted.required');
    });
  });

  describe('Watched session values', () => {
    const thisStepFields = [
      'sepYears',
      'livingTogetherMonths',
      'livingTogetherWeeks',
      'livingTogetherDays',
      'liveTogetherPeriodRemainingDays',
      'referenceDate',
      'mostRecentSeparationDate',
      'separationTimeTogetherPermitted',
      'reasonForDivorceField',
      'livedApartEntireTime',
      'livedTogetherMoreTimeThanPermitted'
    ];

    it('removes all fields if reasonForDivorceLivingApartDateIsSameOrAfterLimitDate does not exsist', () => {
      const previousSession = {
        reasonForDivorceLivingApartDateIsSameOrAfterLimitDate: true,
        livedApartEntireTime: 'Yes',
        livedTogetherMoreTimeThanPermitted: 'Yes',
        separationTimeTogetherPermitted: 'some text'
      };

      const session = clone(previousSession);
      delete session.reasonForDivorceLivingApartDateIsSameOrAfterLimitDate;

      const newSession = removeStaleData(previousSession, session);

      thisStepFields.forEach(property => {
        expect(newSession).not.to.have.property(property);
      });
    });

    it('removes all fields if reasonForDivorceLivingApartDateIsSameOrAfterLimitDate is true', () => {
      const previousSession = {
        reasonForDivorceLivingApartDateIsSameOrAfterLimitDate: false,
        livedApartEntireTime: 'Yes',
        livedTogetherMoreTimeThanPermitted: 'Yes',
        separationTimeTogetherPermitted: 'some text'
      };

      const session = clone(previousSession);
      session.reasonForDivorceLivingApartDateIsSameOrAfterLimitDate = true;

      const newSession = removeStaleData(previousSession, session);

      thisStepFields.forEach(property => {
        expect(newSession).not.to.have.property(property);
      });
    });

    it('removes all fields if reasonForDivorce changes', () => {
      const previousSession = {
        reasonForDivorceLivingApartDateIsSameOrAfterLimitDate: false,
        livedApartEntireTime: 'Yes',
        livedTogetherMoreTimeThanPermitted: 'Yes',
        separationTimeTogetherPermitted: 'some text',
        reasonForDivorce: 'separation-5-years'
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'separation-2-years';

      const newSession = removeStaleData(previousSession, session);

      thisStepFields.forEach(property => {
        expect(newSession).not.to.have.property(property);
      });
    });

    it('does not remove fields if reasonForDivorceLivingApartDateIsSameOrAfterLimitDate is false', () => {
      const previousSession = {
        reasonForDivorceLivingApartDateIsSameOrAfterLimitDate: true,
        livedApartEntireTime: 'Yes',
        livedTogetherMoreTimeThanPermitted: 'Yes',
        separationTimeTogetherPermitted: 'some text'
      };

      const session = clone(previousSession);
      session.reasonForDivorceLivingApartDateIsSameOrAfterLimitDate = false;

      const newSession = removeStaleData(previousSession, session);

      expect(newSession).to.have.property('livedApartEntireTime');
      expect(newSession).to.have.property('livedTogetherMoreTimeThanPermitted');
      expect(newSession).to.have.property('separationTimeTogetherPermitted');
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('Renders separation - time together details ', done => {
      const contentToExist = ['sepQues', 'question.text'];

      const valuesToExist = ['livedApartEntireTime', 'livedTogetherMoreTimeThanPermitted'];

      const context = {
        livedApartEntireTime: 'No',
        livedTogetherMoreTimeThanPermitted: 'No',
        sepYears: '5',
        dateBeforeSepYears: '20/07/2013',
        livingTogetherMonths: '9',
        livingTogetherWeeks: '4',
        livingTogetherDays: '30',
        liveTogetherPeriodRemainingDays: '2',
        referenceDate: '20/01/2013',
        reasonForDivorce: 'separation-2-years'
      };

      testExistenceCYA(
        done,
        underTest,
        content,
        contentToExist,
        valuesToExist,
        context
      );
    });

    describe('Separation-5-years - render content', () => {
      it('Loads content if livingTogetherMonths > 6', done => {
        const context = {
          livedTogetherMoreTimeThanPermitted: 'Yes',
          livingTogetherMonths: 6,
          livingTogetherWeeks: 0,
          liveTogetherPeriodRemainingDays: 3,
          marriageDate: '2001-02-02T00:00:00.000Z',
          reasonForDivorce: 'separation-5-years',
          reasonForDivorceDecisionDate: moment().startOf('day')
            .subtract(constants.five, 'years')
            .subtract(constants.nine, 'months'),
          reasonForDivorceLivingApartDate: moment().startOf('day')
            .subtract(constants.five, 'years')
            .subtract(constants.eight, 'months'),
          referenceDate: '2001-02-01T00:00:00.000Z'
        };

        const contentToExist = [
          'sepQues',
          'question.text',
          'question.6months',
          'question.since',
          'question.mark'
        ];

        const valuesToExist = [ 'referenceDate' ];

        testExistenceCYA(
          done,
          underTest,
          content,
          contentToExist,
          valuesToExist,
          context
        );
      });

      it('Loads content if livingTogetherMonths < 6', done => {
        const context = {
          livedTogetherMoreTimeThanPermitted: 'Yes',
          livingTogetherMonths: 2,
          livingTogetherWeeks: 1,
          liveTogetherPeriodRemainingDays: 3,
          marriageDate: '2001-02-02T00:00:00.000Z',
          reasonForDivorce: 'separation-5-years',
          reasonForDivorceDecisionDate: moment().startOf('day')
            .subtract(constants.five, 'years')
            .subtract(constants.nine, 'months'),
          reasonForDivorceLivingApartDate: moment().startOf('day')
            .subtract(constants.five, 'years')
            .subtract(constants.eight, 'months'),
          mostRecentSeparationDate: '2001-02-01T00:00:00.000Z'
        };

        const contentToExist = [
          'sepQues',
          'question.text',
          'question.week',
          'question.and',
          'question.days',
          'question.since',
          'question.mark'
        ];

        const valuesToExist = [ 'mostRecentSeparationDate' ];

        testExistenceCYA(
          done,
          underTest,
          content,
          contentToExist,
          valuesToExist,
          context
        );
      });
    });
  });

  describe('Desertion - render content', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'husband',
        reasonForDivorce: 'desertion',
        reasonForDivorceDesertionDate: moment().subtract(constants.two, 'years')
          .subtract(constants.four, 'months')
      };
      withSession(done, agent, session);
    });

    const excludeKeys = [
      'sepQues',
      'question.exactDate',
      'question.yearsAndMonths',
      'question.needNotToUse',
      'mustSpentYr',
      'onlyUpTo6Months',
      'ifMoreThan6Months',
      'ifLessThan6Months',
      'info1',
      'info2'
    ];

    it('Loads content if most recent desertion date is = 2 yr 4 months', done => {
      testContent(done, agent, underTest, content, session, excludeKeys);
    });

    it('render calculated values', done => {
      const valuesToTest = [
        '17 weeks',
        '3 days',
        moment().subtract(constants.two, 'years')
          .subtract(constants.four, 'months')
          .format('DD MMMM YYYY')
      ];
      testMultipleValuesExistence(
        done,
        agent,
        underTest,
        valuesToTest,
        session
      );
    });
  });
});

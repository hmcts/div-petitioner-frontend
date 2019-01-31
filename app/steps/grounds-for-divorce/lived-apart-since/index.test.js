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
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('Separation-5-years - render content', () => {
    let session = {};

    beforeEach(done => {
      session = {
        marriageDate: '2001-02-02T00:00:00.000Z',
        reasonForDivorce: 'separation-5-years',
        reasonForDivorceDecisionDate: moment().subtract(constants.five, 'years')
          .subtract(constants.three, 'months'),
        reasonForDivorceLivingApartDate: moment().subtract(constants.five, 'years')
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
        reasonForDivorceDecisionDate: moment().subtract(constants.five, 'years')
          .subtract(constants.nine, 'months'),
        reasonForDivorceLivingApartDate: moment().subtract(constants.five, 'years')
          .subtract(constants.eight, 'months')
      };
      withSession(done, agent, session);
    });

    it('Loads content if most recent sep date is > 5 yr 6 months', done => {
      const excludeKeys = [
        'desQues',
        'question.weeks',
        'question.days',
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
        moment().subtract(constants.five, 'years')
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
        reasonForDivorceDecisionDate: moment().subtract(constants.five, 'years')
          .subtract(constants.six, 'months'),
        reasonForDivorceLivingApartDate: moment().subtract(constants.five, 'years')
          .subtract(constants.seven, 'months')
      };
      withSession(done, agent, session);
    });

    const excludeKeys = [
      'desQues',
      'question.weeks',
      'question.days',
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
        moment().subtract(constants.five, 'years')
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
        reasonForDivorceDecisionDate: moment().subtract(constants.two, 'years')
          .subtract(constants.three, 'months'),
        reasonForDivorceLivingApartDate: moment().subtract(constants.two, 'years')
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
        reasonForDivorceDecisionDate: moment().subtract(constants.two, 'years')
          .subtract(constants.nine, 'months'),
        reasonForDivorceLivingApartDate: moment().subtract(constants.two, 'years')
          .subtract(constants.ten, 'months')
      };
      withSession(done, agent, session);
    });

    it('Loads content if most recent sep date is > 2 yr 6 months', done => {
      const excludeKeys = [
        'desQues',
        'question.weeks',
        'question.days',
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
        moment().subtract(constants.two, 'years')
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
        reasonForDivorceDecisionDate: moment().subtract(constants.two, 'years')
          .subtract(constants.seven, 'months'),
        reasonForDivorceLivingApartDate: moment().subtract(constants.two, 'years')
          .subtract(constants.six, 'months')
      };
      withSession(done, agent, session);
    });

    const excludeKeys = [
      'desQues',
      'question.weeks',
      'question.days',
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
        moment().subtract(constants.two, 'years')
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
        referenceDate: moment().subtract(constants.five, 'years')
          .subtract(constants.six, 'months')
          .format('DD MMMM YYYY')
      };
      testErrors(done, agent, underTest, context, content, 'livedTogetherMoreTimeThanPermitted.required');
    });
  });

  describe('Watched session values', () => {
    const expectFieldsToBeRemoved = newSession => {
      expect(newSession).not.to.have.property('livedApartEntireTime');
      expect(newSession).not.to.have.property('livedTogetherMoreTimeThanPermitted');
    };

    const expectPropertyToExist = (newSession, shouldExists, propertyName) => {
      if (shouldExists) {
        expect(newSession)
          .to.have.property(propertyName, newSession[propertyName]);
      } else {
        expect(newSession)
          .not.to.have.property(propertyName);
      }
    };

    const baseSession = {
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

    it('removes context if reasonForDivorceDecisionDateIsSameOrAfterLimitDate is changed', () => {
      const previousSession = clone(baseSession);
      previousSession.reasonForDivorceDecisionDateIsSameOrAfterLimitDate = true;

      const session = clone(previousSession);
      session.reasonForDivorceDecisionDateIsSameOrAfterLimitDate = false;

      const newSession = removeStaleData(previousSession, session);

      expect(newSession).not.to.have.property('livedTogetherMoreTimeThanPermitted');
      expectPropertyToExist(newSession, true, 'reasonForDivorce');
    });

    it('removes context if reasonForDivorceLivingApartDate is changed', () => {
      const prevSession = clone(baseSession);
      prevSession.reasonForDivorceLivingApartDateIsSameOrAfterLimitDate = true;

      const session = clone(prevSession);
      session.reasonForDivorceLivingApartDateIsSameOrAfterLimitDate = false;

      const newSession = removeStaleData(prevSession, session);

      expectFieldsToBeRemoved(newSession);
      expectPropertyToExist(newSession, true, 'reasonForDivorce');
    });


    it('removes context if livedApartEntireTime is changed', () => {
      const previousSession = clone(baseSession);
      previousSession.livedApartEntireTime = 'No';

      const session = clone(previousSession);
      session.livedApartEntireTime = 'Yes';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession).not.to.have.property('livedTogetherMoreTimeThanPermitted');
      expectPropertyToExist(newSession, true, 'reasonForDivorce');
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
          reasonForDivorceDecisionDate: moment().subtract(constants.five, 'years')
            .subtract(constants.nine, 'months'),
          reasonForDivorceLivingApartDate: moment().subtract(constants.five, 'years')
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
          reasonForDivorceDecisionDate: moment().subtract(constants.five, 'years')
            .subtract(constants.nine, 'months'),
          reasonForDivorceLivingApartDate: moment().subtract(constants.five, 'years')
            .subtract(constants.eight, 'months'),
          mostRecentSeparationDate: '2001-02-01T00:00:00.000Z'
        };

        const contentToExist = [
          'sepQues',
          'question.text',
          'question.weeks',
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

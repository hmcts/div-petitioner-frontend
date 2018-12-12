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
        '5 days',
        '61 days',
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
      const valuesToTest = [ '91 days'];
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
        reasonForDivorceLivingApartEntireTime: 'No',
        reasonForDivorceLivingTogetherMoreThan6Months: 'No'
      };

      testRedirect(done, agent, underTest, context, s.steps.LegalProceedings);
    });

    it(`Living Apart Entire time after separation date : No,
        Living Together More Than 6 Months rule : Yes `, done => {
      const context = {
        reasonForDivorceLivingApartEntireTime: 'No',
        reasonForDivorceLivingTogetherMoreThan6Months: 'Yes'
      };

      testRedirect(done, agent, underTest, context, s.steps.SeparationDateNew);
    });

    it('Living Apart Entire time after separation date : Yes', done => {
      const context = { reasonForDivorceLivingApartEntireTime: 'Yes' };

      testRedirect(done, agent, underTest, context, s.steps.LegalProceedings);
    });
  });

  describe('Test Errors on the page', () => {
    it('reasonForDivorceLivingApartEntireTime : Not selected', done => {
      const context = {};
      testErrors(done, agent, underTest, context,
        content, 'reasonForDivorceLivingApartEntireTime.required');
    });

    it(`reasonForDivorceLivingApartEntireTime :  No ,
        reasonForDivorceLivingTogetherMoreThan6Months : Not selected`, done => {
      const context = {
        reasonForDivorceLivingApartEntireTime: 'No',
        reasonForDivorceLivingTogetherMoreThan6Months: '',
        sepStartDate: moment().subtract(constants.five, 'years')
          .subtract(constants.six, 'months')
          .format('DD MMMM YYYY')
      };
      testErrors(done, agent, underTest, context, content, 'reasonForDivorceLivingTogetherMoreThan6Months.required');
    });
  });

  describe('Watched session values', () => {
    const expectFieldsToBeRemoved = newSession => {
      expect(newSession).not.to.have.property('reasonForDivorceLivingApartEntireTime');
      expect(newSession).not.to.have.property('reasonForDivorceLivingTogetherMoreThan6Months');
      expect(newSession).not.to.have.property('sepYears');
      expect(newSession).not.to.have.property('permittedSepDate');
      expect(newSession).not.to.have.property('livingTogetherMonths');
      expect(newSession).not.to.have.property('livingTogetherWeeks');
      expect(newSession).not.to.have.property('livingTogetherDays');
      expect(newSession).not.to.have.property('liveTogetherPeriodRemainingDays');
      expect(newSession).not.to.have.property('sepStartDate');
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
      reasonForDivorceLivingApartEntireTime: 'No',
      reasonForDivorceLivingTogetherMoreThan6Months: 'No',
      sepYears: '5',
      permittedSepDate: '20/07/2013',
      livingTogetherMonths: '9',
      livingTogetherWeeks: '4',
      livingTogetherDays: '30',
      liveTogetherPeriodRemainingDays: '2',
      sepStartDate: '20/01/2013',
      reasonForDivorce: 'separation-2-years'
    };

    it('removes context if reasonForDivorceDecisionDate is changed', () => {
      const previousSession = clone(baseSession);
      previousSession.reasonForDivorceDecisionDate = '20/02/2013';

      const session = clone(previousSession);
      session.reasonForDivorceDecisionDate = '20/01/2013';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession).not.to.have.property('reasonForDivorceLivingTogetherMoreThan6Months');
      expectPropertyToExist(newSession, true, 'reasonForDivorce');
    });

    it('removes context if reasonForDivorceLivingApartDate is changed', () => {
      const previousSession = clone(baseSession);
      previousSession.reasonForDivorceLivingApartDate = '20/02/2013';

      const session = clone(previousSession);
      session.reasonForDivorceLivingApartDate = '20/01/2013';

      const newSession = removeStaleData(previousSession, session);

      expectFieldsToBeRemoved(newSession);
      expectPropertyToExist(newSession, true, 'reasonForDivorce');
    });


    it('removes context if reasonForDivorceLivingApartEntireTime is changed', () => {
      const previousSession = clone(baseSession);
      previousSession.reasonForDivorceLivingApartEntireTime = 'No';

      const session = clone(previousSession);
      session.reasonForDivorceLivingApartEntireTime = 'Yes';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession).not.to.have.property('reasonForDivorceLivingTogetherMoreThan6Months');
      expectPropertyToExist(newSession, true, 'reasonForDivorce');
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('Renders separation - time together details ', done => {
      const contentToExist = ['ques', 'question.text'];

      const valuesToExist = ['reasonForDivorceLivingApartEntireTime', 'reasonForDivorceLivingTogetherMoreThan6Months'];

      const context = {
        reasonForDivorceLivingApartEntireTime: 'No',
        reasonForDivorceLivingTogetherMoreThan6Months: 'No',
        sepYears: '5',
        permittedSepDate: '20/07/2013',
        livingTogetherMonths: '9',
        livingTogetherWeeks: '4',
        livingTogetherDays: '30',
        liveTogetherPeriodRemainingDays: '2',
        sepStartDate: '20/01/2013',
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
  });
});
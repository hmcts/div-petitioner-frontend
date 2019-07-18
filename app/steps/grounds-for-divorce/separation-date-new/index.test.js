const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const moment = require('moment');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/grounds-for-divorce/separation-date-new';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.SeparationDateNew;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        marriageDate: '2001-02-02T00:00:00.000Z',
        reasonForDivorce: 'separation-2-years'
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      const onlyKeys = ['reasonForDivorceDecisionDate', 'reasonForDivorceLivingDate'];

      testErrors(done, agent, underTest, context,
        content, 'required', onlyKeys, session);
    });

    it('renders error for missing day decision date', done => {
      const context = {
        reasonForDivorceDecisionDay: '',
        reasonForDivorceDecisionMonth: '2',
        reasonForDivorceDecisionYear: '2000'
      };

      testErrors(done, agent, underTest, context, content, 'day.required');
    });

    it('renders error for missing month decision date', done => {
      const context = {
        reasonForDivorceDecisionDay: '1',
        reasonForDivorceDecisionMonth: '',
        reasonForDivorceDecisionYear: '2000'
      };

      testErrors(done, agent, underTest, context, content, 'month.required');
    });

    it('renders error for missing year decision date', done => {
      const context = {
        reasonForDivorceDecisionDay: '1',
        reasonForDivorceDecisionMonth: '2',
        reasonForDivorceDecisionYear: ''
      };

      testErrors(done, agent, underTest, context, content, 'year.required');
    });

    it('renders error for invalid decision date', done => {
      const context = {
        reasonForDivorceDecisionDay: '31',
        reasonForDivorceDecisionMonth: '2',
        reasonForDivorceDecisionYear: '2013'
      };

      testErrors(done, agent, underTest, context, content, 'reasonForDivorceDecisionDate.invalid');
    });

    it('renders error for decision date in future', done => {
      const reasonForDivorceDecisionDateInFuture = moment().add(1, 'years');

      const context = {
        reasonForDivorceDecisionDay:
          reasonForDivorceDecisionDateInFuture.date(),
        reasonForDivorceDecisionMonth:
          reasonForDivorceDecisionDateInFuture.month() + 1,
        reasonForDivorceDecisionYear:
          reasonForDivorceDecisionDateInFuture.year()
      };

      testErrors(done, agent, underTest, context,
        content, 'reasonForDivorceDecisionDateInFuture.invalid');
    });

    it('renders error for decision date "before marriage date"', done => {
      const reasonForDivorceDecisionDateBeforeMarriage = moment(
        session.marriageDate
      ).subtract(1, 'years');

      const context = {
        reasonForDivorceDecisionDay:
          reasonForDivorceDecisionDateBeforeMarriage.date(),
        reasonForDivorceDecisionMonth:
          reasonForDivorceDecisionDateBeforeMarriage.month(),
        reasonForDivorceDecisionYear:
          reasonForDivorceDecisionDateBeforeMarriage.year()
      };

      testErrors(done, agent, underTest, context,
        content, 'reasonForDivorceDecisionDateBeforeMarriageDate.invalid');
    });

    it('renders error for missing day living apart date', done => {
      const context = {
        reasonForDivorceLivingApartDay: '',
        reasonForDivorceLivingApartMonth: '2',
        reasonForDivorceLivingApartYear: '2000'
      };

      testErrors(done, agent, underTest, context, content, 'day.required');
    });

    it('renders error for missing month living apart date', done => {
      const context = {
        reasonForDivorceLivingApartDay: '1',
        reasonForDivorceLivingApartMonth: '',
        reasonForDivorceLivingApartYear: '2000'
      };

      testErrors(done, agent, underTest, context, content, 'month.required');
    });

    it('renders error for missing year living apart date', done => {
      const context = {
        reasonForDivorceLivingApartDay: '1',
        reasonForDivorceLivingApartMonth: '2',
        reasonForDivorceLivingApartYear: ''
      };

      testErrors(done, agent, underTest, context, content, 'year.required');
    });

    it('renders error for invalid living apart date', done => {
      const context = {
        reasonForDivorceDecisionDay: '31',
        reasonForDivorceDecisionMonth: '2',
        reasonForDivorceDecisionYear: '2013'
      };

      testErrors(done, agent, underTest, context, content, 'reasonForDivorceLivingApartDate.invalid');
    });

    it('renders error for living apart date in future', done => {
      const reasonForDivorceLivingApartDateInFuture = moment().add(1, 'years');

      const context = {
        reasonForDivorceLivingApartDay:
          reasonForDivorceLivingApartDateInFuture.date(),
        reasonForDivorceLivingApartMonth:
          reasonForDivorceLivingApartDateInFuture.month() + 1,
        reasonForDivorceLivingApartYear:
          reasonForDivorceLivingApartDateInFuture.year()
      };

      testErrors(done, agent, underTest, context,
        content, 'reasonForDivorceLivingApartDateInFuture.invalid');
    });

    it('renders error for living apart date "before marriage date"', done => {
      const reasonForDivorceLivingApartDateBeforeMarriage = moment(
        session.marriageDate
      ).subtract(1, 'years');

      const context = {
        reasonForDivorceLivingApartDay:
          reasonForDivorceLivingApartDateBeforeMarriage.date(),
        reasonForDivorceLivingApartMonth:
          reasonForDivorceLivingApartDateBeforeMarriage.month(),
        reasonForDivorceLivingApartYear:
          reasonForDivorceLivingApartDateBeforeMarriage.year()
      };

      testErrors(done, agent, underTest, context,
        content, 'reasonForDivorceLivingApartDateBeforeMarriageDate.invalid');
    });
  });


  describe('success (separation-2-years)', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        marriageDate: '2001-02-02T00:00:00.000Z',
        reasonForDivorce: 'separation-2-years'
      };
      withSession(done, agent, session);
    });

    it('redirects to the next page when decision and living apart dates are both before 2 years ago', done => {
      const context = {
        reasonForDivorceDecisionDay: '01',
        reasonForDivorceDecisionMonth: '01',
        reasonForDivorceDecisionYear: '2015',
        reasonForDivorceLivingApartDay: '01',
        reasonForDivorceLivingApartMonth: '01',
        reasonForDivorceLivingApartYear: '2015'
      };

      testRedirect(done, agent, underTest, context, s.steps.LivedApartSince);
    });

    it('redirects to the next page when decision and living apart dates are both after 2 years ago', done => {
      const date1YearAgo = moment().subtract(1, 'years');

      const context = {
        reasonForDivorceDecisionDay: date1YearAgo.date(),
        reasonForDivorceDecisionMonth: date1YearAgo.month() + 1,
        reasonForDivorceDecisionYear: date1YearAgo.year(),
        reasonForDivorceLivingApartDay: date1YearAgo.date(),
        reasonForDivorceLivingApartMonth: date1YearAgo.month() + 1,
        reasonForDivorceLivingApartYear: date1YearAgo.year()
      };

      testRedirect(done, agent, underTest, context, s.steps.ExitSeparation);
    });

    it('redirects to the next page when decision date is after 2 years ago', done => {
      const date1YearAgo = moment().subtract(1, 'years');

      const context = {
        reasonForDivorceDecisionDay: date1YearAgo.date(),
        reasonForDivorceDecisionMonth: date1YearAgo.month() + 1,
        reasonForDivorceDecisionYear: date1YearAgo.year(),
        reasonForDivorceLivingApartDay: '01',
        reasonForDivorceLivingApartMonth: '01',
        reasonForDivorceLivingApartYear: '2015'
      };

      testRedirect(done, agent, underTest, context, s.steps.ExitSeparation);
    });

    it('redirects to the next page when living apart date is after 2 years ago', done => {
      const date1YearAgo = moment().subtract(1, 'years');

      const context = {
        reasonForDivorceDecisionDay: '01',
        reasonForDivorceDecisionMonth: '01',
        reasonForDivorceDecisionYear: '2015',
        reasonForDivorceLivingApartDay: date1YearAgo.date(),
        reasonForDivorceLivingApartMonth: date1YearAgo.month() + 1,
        reasonForDivorceLivingApartYear: date1YearAgo.year()
      };

      testRedirect(done, agent, underTest, context, s.steps.ExitSeparation);
    });
  });

  describe('success (separation-5-years)', () => {
    let session = {};
    const FOUR_YEARS = 4;

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        marriageDate: '2001-02-02T00:00:00.000Z',
        reasonForDivorce: 'separation-5-years'
      };
      withSession(done, agent, session);
    });

    it('redirects to the next page when decision and living apart dates are both before 5 years ago', done => {
      const context = {
        reasonForDivorceDecisionDay: '01',
        reasonForDivorceDecisionMonth: '01',
        reasonForDivorceDecisionYear: '2013',
        reasonForDivorceLivingApartDay: '01',
        reasonForDivorceLivingApartMonth: '01',
        reasonForDivorceLivingApartYear: '2013'
      };

      testRedirect(done, agent, underTest, context, s.steps.LivedApartSince);
    });

    it('redirects to the next page when decision and living apart dates are both after 5 years ago', done => {
      const date4YearAgo = moment().subtract(FOUR_YEARS, 'years');

      const context = {
        reasonForDivorceDecisionDay: date4YearAgo.date(),
        reasonForDivorceDecisionMonth: date4YearAgo.month() + 1,
        reasonForDivorceDecisionYear: date4YearAgo.year(),
        reasonForDivorceLivingApartDay: date4YearAgo.date(),
        reasonForDivorceLivingApartMonth: date4YearAgo.month() + 1,
        reasonForDivorceLivingApartYear: date4YearAgo.year()
      };

      testRedirect(done, agent, underTest, context, s.steps.ExitSeparation);
    });

    it('redirects to the next page when decision date is after 5 years ago', done => {
      const date4YearAgo = moment().subtract(FOUR_YEARS, 'years');

      const context = {
        reasonForDivorceDecisionDay: date4YearAgo.date(),
        reasonForDivorceDecisionMonth: date4YearAgo.month() + 1,
        reasonForDivorceDecisionYear: date4YearAgo.year(),
        reasonForDivorceLivingApartDay: '01',
        reasonForDivorceLivingApartMonth: '01',
        reasonForDivorceLivingApartYear: '2015'
      };

      testRedirect(done, agent, underTest, context, s.steps.ExitSeparation);
    });

    it('redirects to the next page when living apart date is after 5 years ago', done => {
      const date4YearAgo = moment().subtract(FOUR_YEARS, 'years');

      const context = {
        reasonForDivorceDecisionDay: '01',
        reasonForDivorceDecisionMonth: '01',
        reasonForDivorceDecisionYear: '2015',
        reasonForDivorceLivingApartDay: date4YearAgo.date(),
        reasonForDivorceLivingApartMonth: date4YearAgo.month() + 1,
        reasonForDivorceLivingApartYear: date4YearAgo.year()
      };

      testRedirect(done, agent, underTest, context, s.steps.ExitSeparation);
    });
  });

  describe('Watched session values', () => {
    const expectSeparationDateFieldsToBeRemoved = newSession => {
      expect(newSession).not.to.have.property('reasonForDivorceSeperationDay');
      expect(newSession).not.to.have.property('reasonForDivorceSeperationMonth');
      expect(newSession).not.to.have.property('reasonForDivorceSeperationYear');
      expect(newSession).not.to.have.property('reasonForDivorceSeperationDate');
      expect(newSession).not.to.have.property('reasonForDivorceSeperationDateIsSameOrAfterLimitDate');
      expect(newSession).not.to.have.property('reasonForDivorceSeperationDateInFuture');
      expect(newSession).not.to.have.property('reasonForDivorceSeperationDateBeforeMarriageDate');
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

    const expectDecisionDateFieldsToBe = (newSession, removed) => {
      expectPropertyToExist(newSession, !removed, 'reasonForDivorceDecisionDay');
      expectPropertyToExist(newSession, !removed, 'reasonForDivorceDecisionMonth');
      expectPropertyToExist(newSession, !removed, 'reasonForDivorceDecisionYear');
      expectPropertyToExist(newSession, !removed, 'reasonForDivorceDecisionDate');
      expectPropertyToExist(newSession, !removed, 'reasonForDivorceDecisionDateIsSameOrAfterLimitDate');
      expectPropertyToExist(newSession, !removed, 'reasonForDivorceDecisionDateInFuture');
      expectPropertyToExist(newSession, !removed, 'reasonForDivorceDecisionDateBeforeMarriageDate');
    };

    const expectLivingApartDateFieldsToBe = (newSession, removed) => {
      expectPropertyToExist(newSession, !removed, 'reasonForDivorceLivingApartDay');
      expectPropertyToExist(newSession, !removed, 'reasonForDivorceLivingApartMonth');
      expectPropertyToExist(newSession, !removed, 'reasonForDivorceLivingApartYear');
      expectPropertyToExist(newSession, !removed, 'reasonForDivorceLivingApartDate');
      expectPropertyToExist(newSession, !removed, 'reasonForDivorceLivingApartDateIsSameOrAfterLimitDate');
      expectPropertyToExist(newSession, !removed, 'reasonForDivorceLivingApartDateInFuture');
      expectPropertyToExist(newSession, !removed, 'reasonForDivorceLivingApartDateBeforeMarriageDate');
    };

    const baseSession = {
      reasonForDivorceDecisionDay: '1',
      reasonForDivorceDecisionMonth: '1',
      reasonForDivorceDecisionYear: '2010',
      reasonForDivorceDecisionDate: 'date',
      reasonForDivorceDecisionDateIsSameOrAfterLimitDate: true,
      reasonForDivorceDecisionDateInFuture: true,
      reasonForDivorceDecisionDateBeforeMarriageDate: true,
      reasonForDivorceLivingApartDay: '1',
      reasonForDivorceLivingApartMonth: '1',
      reasonForDivorceLivingApartYear: '2010',
      reasonForDivorceLivingApartDate: 'date',
      reasonForDivorceLivingApartDateIsSameOrAfterLimitDate: true,
      reasonForDivorceLivingApartDateInFuture: true,
      reasonForDivorceLivingApartDateBeforeMarriageDate: true
    };

    it('removes all fields if reason for divorce is not separation-2-years', () => {
      const previousSession = clone(baseSession);
      previousSession.reasonForDivorce = 'separation-2-years';

      const session = clone(previousSession);
      session.reasonForDivorce = 'adultery';

      const newSession = removeStaleData(previousSession, session);

      expectSeparationDateFieldsToBeRemoved(newSession);
      expectDecisionDateFieldsToBe(newSession, true);
      expectLivingApartDateFieldsToBe(newSession, true);
    });

    it('removes context if reasonForDivorce is not separation-5-years', () => {
      const previousSession = clone(baseSession);
      previousSession.reasonForDivorce = 'separation-5-years';

      const session = clone(previousSession);
      session.reasonForDivorce = 'adultery';

      const newSession = removeStaleData(previousSession, session);

      expectSeparationDateFieldsToBeRemoved(newSession);
      expectDecisionDateFieldsToBe(newSession, true);
      expectLivingApartDateFieldsToBe(newSession, true);
    });

    it('does not remove context if reasonForDivorce is set to separation-2-years', () => {
      const previousSession = clone(baseSession);
      previousSession.reasonForDivorce = 'separation-5-years';

      const session = clone(previousSession);
      session.reasonForDivorce = 'separation-2-years';

      const newSession = removeStaleData(previousSession, session);

      expectSeparationDateFieldsToBeRemoved(newSession);
      expectDecisionDateFieldsToBe(newSession, false);
      expectLivingApartDateFieldsToBe(newSession, false);
    });

    it('does not remove context if reasonForDivorce is set to separation-5-years', () => {
      const previousSession = clone(baseSession);
      previousSession.reasonForDivorce = 'separation-2-years';

      const session = clone(previousSession);
      session.reasonForDivorce = 'separation-5-years';

      const newSession = removeStaleData(previousSession, session);

      expectSeparationDateFieldsToBeRemoved(newSession);
      expectDecisionDateFieldsToBe(newSession, false);
      expectLivingApartDateFieldsToBe(newSession, false);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders reason for divorce separation dates', done => {
      const contentToExist = ['question1.text', 'question2.text'];

      const valuesToExist = ['reasonForDivorceDecisionDate', 'reasonForDivorceLivingApartDate'];

      const context = {
        reasonForDivorceDecisionDay: '10',
        reasonForDivorceDecisionMonth: '10',
        reasonForDivorceDecisionYear: '2010',
        reasonForDivorceDecisionDate: '10th October 2010',
        reasonForDivorceLivingApartDay: '11',
        reasonForDivorceLivingApartMonth: '11',
        reasonForDivorceLivingApartYear: '2011',
        reasonForDivorceLivingApartDate: '11th November 2011'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

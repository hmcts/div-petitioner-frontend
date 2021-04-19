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

const modulePath = 'app/steps/grounds-for-divorce/separation-date';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.SeparationDate;
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

      const onlyKeys = ['reasonForDivorceSeperationDate'];

      testErrors(done, agent, underTest, context,
        content, 'required', onlyKeys, session);
    });

    it('renders error for missing day', done => {
      const context = {
        reasonForDivorceSeperationDay: '',
        reasonForDivorceSeperationMonth: '2',
        reasonForDivorceSeperationYear: '2000'
      };

      testErrors(done, agent, underTest, context, content, 'day.required');
    });

    it('renders error for missing month', done => {
      const context = {
        reasonForDivorceSeperationDay: '1',
        reasonForDivorceSeperationMonth: '',
        reasonForDivorceSeperationYear: '2000'
      };

      testErrors(done, agent, underTest, context, content, 'month.required');
    });

    it('renders error for missing year', done => {
      const context = {
        reasonForDivorceSeperationDay: '1',
        reasonForDivorceSeperationMonth: '2',
        reasonForDivorceSeperationYear: ''
      };

      testErrors(done, agent, underTest, context, content, 'year.required');
    });

    it('renders error for invalid date', done => {
      const context = {
        reasonForDivorceSeperationDay: '31',
        reasonForDivorceSeperationMonth: '2',
        reasonForDivorceSeperationYear: '2013'
      };

      testErrors(done, agent, underTest, context,
        content, 'reasonForDivorceSeperationDate.invalid');
    });

    it('renders error for future date', done => {
      const reasonForDivorceSeperationDateInFuture = moment().add(1, 'years');

      const context = {
        reasonForDivorceSeperationDay:
          reasonForDivorceSeperationDateInFuture.date(),
        reasonForDivorceSeperationMonth:
          reasonForDivorceSeperationDateInFuture.month() + 1,
        reasonForDivorceSeperationYear:
          reasonForDivorceSeperationDateInFuture.year()
      };

      testErrors(done, agent, underTest, context,
        content, 'reasonForDivorceSeperationDateInFuture.invalid');
    });

    it('renders error for "before marriage date"', done => {
      const reasonForDivorceSeperationDateBeforeMarriage = moment(
        session.marriageDate
      ).subtract(1, 'years');

      const context = {
        reasonForDivorceSeperationDay:
          reasonForDivorceSeperationDateBeforeMarriage.date(),
        reasonForDivorceSeperationMonth:
          reasonForDivorceSeperationDateBeforeMarriage.month(),
        reasonForDivorceSeperationYear:
          reasonForDivorceSeperationDateBeforeMarriage.year()
      };

      testErrors(done, agent, underTest, context,
        content, 'reasonForDivorceSeperationDateBeforeMarriageDate.invalid');
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

    it('redirects to the next page when separation date is before 2 years ago', done => {
      const context = {
        reasonForDivorceSeperationDay: '01',
        reasonForDivorceSeperationMonth: '01',
        reasonForDivorceSeperationYear: '2015'
      };
      testRedirect(done, agent, underTest, context, s.steps.LegalProceedings);
    });

    it('redirects to the exit page when separation date is after 2 years ago', done => {
      const date1YearAgo = moment().subtract(1, 'years');

      const context = {
        reasonForDivorceSeperationDay: date1YearAgo.date(),
        reasonForDivorceSeperationMonth: date1YearAgo.month() + 1,
        reasonForDivorceSeperationYear: date1YearAgo.year()
      };
      testRedirect(done, agent, underTest, context, s.steps.ExitSeparation);
    });
  });

  describe('success (separation-5-years)', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        marriageDate: '2001-02-02T00:00:00.000Z',
        reasonForDivorce: 'separation-5-years'
      };
      withSession(done, agent, session);
    });

    it('redirects to the next page when separation date is before 5 years ago', done => {
      const context = {
        reasonForDivorceSeperationDay: '01',
        reasonForDivorceSeperationMonth: '01',
        reasonForDivorceSeperationYear: '2010'
      };
      testRedirect(done, agent, underTest, context, s.steps.LegalProceedings);
    });

    it('redirects to the exit page when separation date is after 5 years ago', done => {
      const FOUR_YEARS = 4;
      const date1YearAgo = moment().subtract(FOUR_YEARS, 'years');

      const context = {
        reasonForDivorceSeperationDay: date1YearAgo.date(),
        reasonForDivorceSeperationMonth: date1YearAgo.month() + 1,
        reasonForDivorceSeperationYear: date1YearAgo.year()
      };
      testRedirect(done, agent, underTest, context, s.steps.ExitSeparation);
    });
  });

  describe('Watched session values', () => {
    it('removes context if reasonForDivorce is not seperation-2-years', () => {
      const previousSession = {
        reasonForDivorce: 'seperation-2-years',
        reasonForDivorceSeperationDay: '1',
        reasonForDivorceSeperationMonth: '1',
        reasonForDivorceSeperationYear: '2010',
        reasonForDivorceSeperationDate: 'date',
        reasonForDivorceSeperationDateIsSameOrAfterLimitDate: true,
        reasonForDivorceSeperationDateInFuture: true,
        reasonForDivorceSeperationDateBeforeMarriageDate: true
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'adultery';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.reasonForDivorceSeperationDay)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceSeperationMonth)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceSeperationYear)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceSeperationDate)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceSeperationDateIsSameOrAfterLimitDate) // eslint-disable-line max-len
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceSeperationDateInFuture)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceSeperationDateBeforeMarriageDate)
        .to.equal('undefined');
    });

    it('removes context if reasonForDivorce is not seperation-5-years', () => {
      const previousSession = {
        reasonForDivorce: 'seperation-5-years',
        reasonForDivorceSeperationDay: '1',
        reasonForDivorceSeperationMonth: '1',
        reasonForDivorceSeperationYear: '2010',
        reasonForDivorceSeperationDate: 'date',
        reasonForDivorceSeperationDateIsSameOrAfterLimitDate: true,
        reasonForDivorceSeperationDateInFuture: true,
        reasonForDivorceSeperationDateBeforeMarriageDate: true
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'adultery';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.reasonForDivorceSeperationDay)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceSeperationMonth)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceSeperationYear)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceSeperationDate)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceSeperationDateIsSameOrAfterLimitDate) // eslint-disable-line max-len
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceSeperationDateInFuture)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceSeperationDateBeforeMarriageDate)
        .to.equal('undefined');
    });

    it('does not remove context if reasonForDivorce is set to seperation-2-years', () => {
      const previousSession = {
        reasonForDivorce: 'seperation-5-years',
        reasonForDivorceSeperationDay: '1',
        reasonForDivorceSeperationMonth: '1',
        reasonForDivorceSeperationYear: '2010',
        reasonForDivorceSeperationDate: 'date',
        reasonForDivorceSeperationDateIsSameOrAfterLimitDate: true,
        reasonForDivorceSeperationDateInFuture: true,
        reasonForDivorceSeperationDateBeforeMarriageDate: true
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'separation-2-years';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorce).to.equal('separation-2-years');
      expect(newSession.reasonForDivorceSeperationDay)
        .to.equal(previousSession.reasonForDivorceSeperationDay);
      expect(newSession.reasonForDivorceSeperationMonth)
        .to.equal(previousSession.reasonForDivorceSeperationMonth);
      expect(newSession.reasonForDivorceSeperationYear)
        .to.equal(previousSession.reasonForDivorceSeperationYear);
      expect(newSession.reasonForDivorceSeperationDate)
        .to.equal(previousSession.reasonForDivorceSeperationDate);
      expect(newSession.reasonForDivorceSeperationDateIsSameOrAfterLimitDate)
        .to.equal(
          previousSession.reasonForDivorceSeperationDateIsSameOrAfterLimitDate
        );
      expect(newSession.reasonForDivorceSeperationDateInFuture)
        .to.equal(previousSession.reasonForDivorceSeperationDateInFuture);
      expect(newSession.reasonForDivorceSeperationDateBeforeMarriageDate)
        .to.equal(
          previousSession.reasonForDivorceSeperationDateBeforeMarriageDate
        );
    });

    it('does not remove context if reasonForDivorce is set to seperation-5-years', () => {
      const previousSession = {
        reasonForDivorce: 'seperation-2-years',
        reasonForDivorceSeperationDay: '1',
        reasonForDivorceSeperationMonth: '1',
        reasonForDivorceSeperationYear: '2010',
        reasonForDivorceSeperationDate: 'date',
        reasonForDivorceSeperationDateIsSameOrAfterLimitDate: true,
        reasonForDivorceSeperationDateInFuture: true,
        reasonForDivorceSeperationDateBeforeMarriageDate: true
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'separation-5-years';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorce).to.equal('separation-5-years');
      expect(newSession.reasonForDivorceSeperationDay)
        .to.equal(previousSession.reasonForDivorceSeperationDay);
      expect(newSession.reasonForDivorceSeperationMonth)
        .to.equal(previousSession.reasonForDivorceSeperationMonth);
      expect(newSession.reasonForDivorceSeperationYear)
        .to.equal(previousSession.reasonForDivorceSeperationYear);
      expect(newSession.reasonForDivorceSeperationDate)
        .to.equal(previousSession.reasonForDivorceSeperationDate);
      expect(newSession.reasonForDivorceSeperationDateIsSameOrAfterLimitDate)
        .to.equal(
          previousSession.reasonForDivorceSeperationDateIsSameOrAfterLimitDate
        );
      expect(newSession.reasonForDivorceSeperationDateInFuture)
        .to.equal(previousSession.reasonForDivorceSeperationDateInFuture);
      expect(newSession.reasonForDivorceSeperationDateBeforeMarriageDate)
        .to.equal(
          previousSession.reasonForDivorceSeperationDateBeforeMarriageDate
        );
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders reason for divorce seperation date', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['reasonForDivorceSeperationDate'];

      const context = {
        reasonForDivorceSeperationDay: '10',
        reasonForDivorceSeperationMonth: '10',
        reasonForDivorceSeperationYear: '2010',
        reasonForDivorceSeperationDate: '10th October 2010'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

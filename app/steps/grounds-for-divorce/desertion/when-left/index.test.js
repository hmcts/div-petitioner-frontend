/* eslint no-console: "off" */
const request = require('supertest');
const {
  testContent, testErrors, testRedirect,
  testCYATemplate, testExistenceCYA
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const moment = require('moment');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/grounds-for-divorce/desertion/when-left';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.DesertionDate;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      const TWENTY_YEARS = 20;

      session = {
        divorceWho: 'wife',
        marriageDate: moment().subtract(TWENTY_YEARS, 'years')
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });

    it('renders errors for missing required context', done => {
      const context = { divorceWho: 'wife' };

      testErrors(done, agent, underTest, context,
        content, 'required', 'divorceWho');
    });

    it('renders error for missing day', done => {
      const context = {
        reasonForDivorceDesertionDay: '',
        reasonForDivorceDesertionMonth: '2',
        reasonForDivorceDesertionYear: '2000'
      };

      testErrors(done, agent, underTest, context, content, 'day.required');
    });

    it('renders error for missing month', done => {
      const context = {
        reasonForDivorceDesertionDay: '1',
        reasonForDivorceDesertionMonth: '',
        reasonForDivorceDesertionYear: '2000'
      };

      testErrors(done, agent, underTest, context, content, 'month.required');
    });

    it('renders error for missing year', done => {
      const context = {
        reasonForDivorceDesertionDay: '1',
        reasonForDivorceDesertionMonth: '2',
        reasonForDivorceDesertionYear: ''
      };

      testErrors(done, agent, underTest, context, content, 'year.required');
    });

    it('renders error for invalid date', done => {
      const context = {
        reasonForDivorceDesertionDay: '31',
        reasonForDivorceDesertionMonth: '2',
        reasonForDivorceDesertionYear: '2013'
      };

      testErrors(done, agent, underTest, context,
        content, 'reasonForDivorceDesertionDate.invalid');
    });

    it('renders error for desertion date that is before marriage date', done => {
      const TWENTY_FIVE_YEARS = 25;

      const reasonForDivorceDesertionDateBeforeMarriage = moment().subtract(
        TWENTY_FIVE_YEARS, 'years'
      );

      const context = {
        reasonForDivorceDesertionDay:
          reasonForDivorceDesertionDateBeforeMarriage.date(),
        reasonForDivorceDesertionMonth:
          reasonForDivorceDesertionDateBeforeMarriage.month() + 1,
        reasonForDivorceDesertionYear:
          reasonForDivorceDesertionDateBeforeMarriage.year()
      };

      testErrors(done, agent, underTest, context,
        content, 'reasonForDivorceDesertionBeforeMarriage.invalid');
    });

    it('renders error for future date', done => {
      const reasonForDivorceDesertionDateInFuture = moment().add(1, 'years');

      const context = {
        reasonForDivorceDesertionDay:
          reasonForDivorceDesertionDateInFuture.date(),
        reasonForDivorceDesertionMonth:
          reasonForDivorceDesertionDateInFuture.month() + 1,
        reasonForDivorceDesertionYear:
          reasonForDivorceDesertionDateInFuture.year()
      };

      testErrors(done, agent, underTest, context,
        content, 'reasonForDivorceDesertionDateInFuture.invalid');
    });

    it('redirects to the next page', done => {
      const THREE_YEARS = 3;

      const reasonForDivorceDesertionDate3YearsAgo = moment().subtract(THREE_YEARS, 'years');

      const context = {
        reasonForDivorceDesertionDay:
          reasonForDivorceDesertionDate3YearsAgo.date(),
        reasonForDivorceDesertionMonth:
          reasonForDivorceDesertionDate3YearsAgo.month() + 1,
        reasonForDivorceDesertionYear:
          reasonForDivorceDesertionDate3YearsAgo.year()
      };

      testRedirect(done, agent, underTest, context, s.steps.DesertionAgree);
    });

    it('redirects to the exit page', done => {
      const reasonForDivorceDesertionDate1YearAgo = moment().subtract(1, 'years');

      const context = {
        reasonForDivorceDesertionDay:
          reasonForDivorceDesertionDate1YearAgo.date(),
        reasonForDivorceDesertionMonth:
          reasonForDivorceDesertionDate1YearAgo.month() + 1,
        reasonForDivorceDesertionYear:
          reasonForDivorceDesertionDate1YearAgo.year()
      };

      testRedirect(done, agent, underTest, context, s.steps.ExitDesertionDate);
    });
  });

  describe('Watched session values', () => {
    it('removes reasonForDivorceDesertionDate fields if reasonForDivorce is changed', () => {
      const previousSession = {
        reasonForDivorceDesertionDay: '1',
        reasonForDivorceDesertionMonth: '1',
        reasonForDivorceDesertionYear: '2010',
        reasonForDivorceDesertionBeforeMarriage: true,
        reasonForDivorceDesertionDateInFuture: false,
        reasonForDivorceDesertionDate: '2010-01-01T00:00:00.000Z',
        reasonForDivorce: 'desertion'
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'anything';

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.reasonForDivorceDesertionDay)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceDesertionMonth)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceDesertionYear)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceDesertionBeforeMarriage)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceDesertionDateInFuture)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceDesertionDate)
        .to.equal('undefined');
    });

    it('do not remove reasonForDivorceDesertionDate fields if reasonForDivorce does not change', () => {
      const previousSession = {
        reasonForDivorceDesertionDay: '1',
        reasonForDivorceDesertionMonth: '1',
        reasonForDivorceDesertionYear: '2010',
        reasonForDivorceDesertionBeforeMarriage: true,
        reasonForDivorceDesertionDateInFuture: false,
        reasonForDivorceDesertionDate: '2010-01-01T00:00:00.000Z',
        reasonForDivorce: 'desertion'
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'desertion';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.reasonForDivorceDesertionDay)
        .to.equal(previousSession.reasonForDivorceDesertionDay);
      expect(newSession.reasonForDivorceDesertionMonth)
        .to.equal(previousSession.reasonForDivorceDesertionMonth);
      expect(newSession.reasonForDivorceDesertionYear)
        .to.equal(previousSession.reasonForDivorceDesertionYear);
      expect(newSession.reasonForDivorceDesertionBeforeMarriage)
        .to.equal(previousSession.reasonForDivorceDesertionBeforeMarriage);
      expect(newSession.reasonForDivorceDesertionDateInFuture)
        .to.equal(previousSession.reasonForDivorceDesertionDateInFuture);
      expect(newSession.reasonForDivorceDesertionDate)
        .to.equal(previousSession.reasonForDivorceDesertionDate);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders desertion when left', done => {
      const contentToExist = ['question'];

      const valuesToExist = [
        'reasonForDivorceDesertionDate',
        'divorceWho'
      ];

      const context = {
        reasonForDivorceDesertionDay: 14,
        reasonForDivorceDesertionMonth: 11,
        reasonForDivorceDesertionYear: 2017,
        reasonForDivorceDesertionDate: '14th November 2017',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

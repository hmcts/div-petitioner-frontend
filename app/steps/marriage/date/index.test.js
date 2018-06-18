/* eslint no-console: "off" */
const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const moment = require('moment');
const server = require('app');
const idamMock = require('test/mocks/idam');
const featureTogglesMock = require('test/mocks/featureToggles');

const modulePath = 'app/steps/marriage/date';

const content = require(`${modulePath}/content`);

const ONE_HUNDRED_YEARS = 100;
const TEN_MONTHS = 10;

let s = {};
let agent = {};
let stepUnderTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    featureTogglesMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    stepUnderTest = s.steps.MarriageDate;
  });

  afterEach(() => {
    idamMock.restore();
    featureTogglesMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, stepUnderTest, content, session);
    });

    it('renders error for missing required context', done => {
      const context = {};

      testErrors(done, agent, stepUnderTest, context, content, 'marriageDate.required');
    });

    it('renders error for missing day', done => {
      const context = {
        marriageDateDay: '',
        marriageDateMonth: '2',
        marriageDateYear: '2000'
      };

      testErrors(done, agent, stepUnderTest, context, content, 'day.required');
    });

    it('renders error for missing month', done => {
      const context = {
        marriageDateDay: '1',
        marriageDateMonth: '',
        marriageDateYear: '2000'
      };

      testErrors(done, agent, stepUnderTest, context, content, 'month.required');
    });

    it('renders error for missing year', done => {
      const context = {
        marriageDateDay: '1',
        marriageDateMonth: '2',
        marriageDateYear: ''
      };

      testErrors(done, agent, stepUnderTest, context, content, 'year.required');
    });

    it('renders error for invalid date', done => {
      const context = {
        marriageDateDay: '31',
        marriageDateMonth: '2',
        marriageDateYear: '2013'
      };

      testErrors(done, agent, stepUnderTest, context, content, 'marriageDate.invalid');
    });

    it('renders error for future date', done => {
      const marriageDateInFuture = moment().add(1, 'years');

      const context = {
        marriageDateDay: marriageDateInFuture.date(),
        marriageDateMonth: marriageDateInFuture.month() + 1,
        marriageDateYear: marriageDateInFuture.year()
      };

      testErrors(done, agent, stepUnderTest, context, content, 'isFuture.invalid');
    });

    it('renders error for "more than 100 years in the past"', done => {
      const marriageDateOld = moment().subtract(ONE_HUNDRED_YEARS, 'years');

      const context = {
        marriageDateDay: marriageDateOld.date(),
        marriageDateMonth: marriageDateOld.month() - 1,
        marriageDateYear: marriageDateOld.year()
      };

      testErrors(done, agent, stepUnderTest, context, content, 'moreThan100.invalid');
    });

    it('redirects to the exit page when a date 1 year or less in the past is entered', done => {
      const marriageDate1YearAgo = moment().subtract(TEN_MONTHS, 'months');

      const context = {
        marriageDateDay: marriageDate1YearAgo.date(),
        marriageDateMonth: marriageDate1YearAgo.format('MM'),
        marriageDateYear: marriageDate1YearAgo.year()
      };

      testRedirect(done, agent, stepUnderTest, context,
        s.steps.ExitMarriageDate);
    });

    it('redirects to the next page', done => {
      const context = {
        marriageDateDay: '01',
        marriageDateMonth: '01',
        marriageDateYear: '2000'
      };

      testRedirect(done, agent, stepUnderTest, context, s.steps.MarriedInUk);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, stepUnderTest);
    });

    it('renders the marriage date', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['marriageDate'];

      const context = {
        marriageDateDay: 14,
        marriageDateMonth: 11,
        marriageDateYear: 2017,
        marriageDate: '14th November 2017'
      };

      testExistenceCYA(done, stepUnderTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

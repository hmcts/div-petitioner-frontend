/* eslint-disable no-magic-numbers */
const moment = require('moment');
const timekeeper = require('timekeeper');
const { expect } = require('test/util/chai');

const modulePath = 'app/services/separationDates';
const underTest = require(modulePath);

const constants = {
  days: 'days',
  weeks: 'weeks',
  months: 'months',
  years: 'years'
};

describe(modulePath, () => {
  let session = {};

  beforeEach(() => {
    timekeeper.freeze(new Date('2001-05-01T11:00:00Z'));
  });

  afterEach(() => {
    timekeeper.reset();
  });

  describe('getSeparationTimeTogetherPermitted', () => {
    it('should return more than 6 months when time together permitted is greater than 1 year', () => {
      const separationDate = moment().startOf(constants.days)
        .subtract(5, constants.years)
        .subtract(15, constants.months);
      session = {
        reasonForDivorce: 'separation-5-years',
        reasonForDivorceDecisionDate: separationDate,
        reasonForDivorceLivingApartDate: separationDate
      };

      expect('6 months').to.equal(underTest.getSeparationTimeTogetherPermitted(session));
    });

    it('should return more than 6 months when time together permitted is greater than six months', () => {
      const separationDate = moment().startOf(constants.days)
        .subtract(5, constants.years)
        .subtract(9, constants.months);
      session = {
        reasonForDivorce: 'separation-5-years',
        reasonForDivorceDecisionDate: separationDate,
        reasonForDivorceLivingApartDate: separationDate
      };

      expect('6 months').to.equal(underTest.getSeparationTimeTogetherPermitted(session));
    });

    it('should return more than 6 months when time together permitted is six months', () => {
      const separationDate = moment().startOf(constants.days)
        .subtract(5, constants.years)
        .subtract(6, constants.months);
      session = {
        reasonForDivorce: 'separation-5-years',
        reasonForDivorceDecisionDate: separationDate,
        reasonForDivorceLivingApartDate: separationDate
      };

      expect('6 months').to.equal(underTest.getSeparationTimeTogetherPermitted(session));
    });

    it('should return 25 weeks and a bit when time together permitted is slightly under six months', () => {
      const separationDate = moment().startOf(constants.days)
        .subtract(5, constants.years)
        .subtract(6, constants.months)
        .add(1, constants.days);
      session = {
        reasonForDivorce: 'separation-5-years',
        reasonForDivorceDecisionDate: separationDate,
        reasonForDivorceLivingApartDate: separationDate
      };

      expect('25 weeks and 6 days').to.equal(underTest.getSeparationTimeTogetherPermitted(session));
    });

    it('should return weeks and days when time together permitted is less than 6 months', () => {
      const separationDate = moment().startOf(constants.days)
        .subtract(5, constants.years)
        .subtract(2, constants.weeks)
        .subtract(2, constants.days);
      session = {
        reasonForDivorce: 'separation-5-years',
        reasonForDivorceDecisionDate: separationDate,
        reasonForDivorceLivingApartDate: separationDate
      };

      expect('2 weeks and 2 days').to.equal(underTest.getSeparationTimeTogetherPermitted(session));
    });

    it('should return week and day when time together permitted is less than 6 months', () => {
      const separationDate = moment().startOf(constants.days)
        .subtract(5, constants.years)
        .subtract(1, constants.weeks)
        .subtract(1, constants.days);
      session = {
        reasonForDivorce: 'separation-5-years',
        reasonForDivorceDecisionDate: separationDate,
        reasonForDivorceLivingApartDate: separationDate
      };

      expect('1 week and 1 day').to.equal(underTest.getSeparationTimeTogetherPermitted(session));
    });

    it('should return only week when time together permitted is less than 6 months', () => {
      const separationDate = moment().startOf(constants.days)
        .subtract(5, constants.years)
        .subtract(1, constants.weeks);
      session = {
        reasonForDivorce: 'separation-5-years',
        reasonForDivorceDecisionDate: separationDate,
        reasonForDivorceLivingApartDate: separationDate
      };

      expect('1 week').to.equal(underTest.getSeparationTimeTogetherPermitted(session));
    });

    it('should return only day when time together permitted is less than 6 months', () => {
      const separationDate = moment().startOf(constants.days)
        .subtract(5, constants.years)
        .subtract(1, constants.days);
      session = {
        reasonForDivorce: 'separation-5-years',
        reasonForDivorceDecisionDate: separationDate,
        reasonForDivorceLivingApartDate: separationDate
      };

      expect('1 day').to.equal(underTest.getSeparationTimeTogetherPermitted(session));
    });
  });
});

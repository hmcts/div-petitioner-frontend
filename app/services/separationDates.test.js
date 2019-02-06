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
    timekeeper.freeze(new Date('04/01/2000'));
  });

  afterEach(() => {
    timekeeper.reset();
  });

  describe('getSeparationTimeTogetherPermitted', () => {
    it('should return more than 6 months when time together permitted is greater than six', () => {
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

    it('should return months, weeks and days when time together permitted is less than 6 months', () => {
      const separationDate = moment().startOf(constants.days)
        .subtract(5, constants.years)
        .subtract(3, constants.months)
        .subtract(2, constants.weeks)
        .subtract(2, constants.days);
      session = {
        reasonForDivorce: 'separation-5-years',
        reasonForDivorceDecisionDate: separationDate,
        reasonForDivorceLivingApartDate: separationDate
      };

      expect('3 months, 2 weeks and 2 days').to.equal(underTest.getSeparationTimeTogetherPermitted(session));
    });

    it('should return month, week and day when time together permitted is less than 6 months', () => {
      const separationDate = moment().startOf(constants.days)
        .subtract(5, constants.years)
        .subtract(1, constants.months)
        .subtract(1, constants.weeks)
        .subtract(1, constants.days);
      session = {
        reasonForDivorce: 'separation-5-years',
        reasonForDivorceDecisionDate: separationDate,
        reasonForDivorceLivingApartDate: separationDate
      };

      expect('1 month, 1 week and 1 day').to.equal(underTest.getSeparationTimeTogetherPermitted(session));
    });
  });
});

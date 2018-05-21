const CONF = require('config');
const moment = require('moment');
const ValidationStep = require('app/core/steps/ValidationStep');
const { filter, some, isEmpty, map } = require('lodash');
const utils = require('app/services/utils');

const DATE_FORMAT = CONF.dateFormat;

const ONE_HUNDRED_YEARS = 100;

module.exports = class MarriageDate extends ValidationStep {
  get url() {
    return '/about-your-marriage/date-of-marriage-certificate';
  }
  get nextStep() {
    return {
      marriageCanDivorce: {
        true: this.steps.MarriedInUk,
        false: this.steps.ExitMarriageDate
      }
    };
  }

  interceptor(ctx) {
    if (utils.dateEmpty(ctx.marriageDateDay, ctx.marriageDateMonth, ctx.marriageDateYear)) {
      delete ctx.marriageDate;
      ctx.marriageCanDivorce = false;
      ctx.marriageDateIsFuture = false;
      ctx.marriageDateMoreThan100 = false;
      return ctx;
    }

    const marriageDate = moment(`${ctx.marriageDateDay}/${ctx.marriageDateMonth}/${ctx.marriageDateYear}`, DATE_FORMAT);
    const oneYearAgo = moment().subtract(1, 'year')
      .subtract(1, 'days');
    const hundredYearsAgo = moment().subtract(ONE_HUNDRED_YEARS, 'year')
      .subtract(1, 'days');

    ctx.marriageDate = marriageDate.toISOString();
    ctx.marriageCanDivorce = marriageDate.isBefore(oneYearAgo);
    ctx.marriageDateIsFuture = marriageDate.diff(new Date()) > 0;
    ctx.marriageDateMoreThan100 = marriageDate.isBefore(hundredYearsAgo);

    return ctx;
  }

  validate(ctx) {
    let [isValid, errors] = super.validate(ctx); // eslint-disable-line prefer-const

    if (!isEmpty(errors)) {
      if (some(errors, error => {
        return error.param === 'marriageDate';
      })) {
        errors = filter(errors, error => {
          return !(/^day|month|year/.test(error.param));
        });
      }

      errors = map(errors, error => {
        if (error.param === 'marriageDateIsFuture' || error.param === 'marriageDateMoreThan100') {
          error.param = 'marriageDate';
        }
        return error;
      });
    }

    return [isValid, errors];
  }

  checkYourAnswersInterceptor(ctx) {
    const marriageDate = moment(`${ctx.marriageDateDay}/${ctx.marriageDateMonth}/${ctx.marriageDateYear}`, DATE_FORMAT);
    ctx.marriageDate = marriageDate.format('Do MMMM YYYY');
    return ctx;
  }
};

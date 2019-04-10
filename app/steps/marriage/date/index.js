const CONF = require('config');
const moment = require('moment');
const ValidationStep = require('app/core/steps/ValidationStep');
const { isEmpty, isUndefined } = require('lodash');
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

    // find marriageDate errors
    const findMarriageDateError = error => {
      return error.param === 'marriageDate';
    };

    // find date field errors
    const dateFieldErrors = ['marriageDateDay', 'marriageDateMonth', 'marriageDateYear'];
    const findDateFieldError = error => {
      return dateFieldErrors.includes(error.param);
    };

    if (!isEmpty(errors)) {
      // if no marriageDate then no dates have been entered so
      if (isUndefined(ctx.marriageDate)) {
        errors = errors.filter(findMarriageDateError);
      }

      // if any errors are date field errors only show date field errors
      if (errors.find(findDateFieldError)) {
        errors = errors.filter(findDateFieldError);
      }
    }

    return [isValid, errors];
  }

  checkYourAnswersInterceptor(ctx) {
    const marriageDate = moment(`${ctx.marriageDateDay}/${ctx.marriageDateMonth}/${ctx.marriageDateYear}`, DATE_FORMAT);
    ctx.marriageDate = marriageDate.format('Do MMMM YYYY');
    return ctx;
  }
};

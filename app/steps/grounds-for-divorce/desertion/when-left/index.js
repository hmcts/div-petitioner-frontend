const CONF = require('config');
const moment = require('moment');
const ValidationStep = require('app/core/steps/ValidationStep');
const { filter, some, map } = require('lodash');
const utils = require('app/services/utils');
const { watch } = require('app/core/helpers/staleDataManager');

const DATE_FORMAT = CONF.dateFormat;
const TWO_YEARS = 2;

module.exports = class DesertionDate extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/desertion/when';
  }

  get nextStep() {
    return {
      reasonForDivorceDesertionAlright: {
        true: this.steps.DesertionAgree,
        false: this.steps.ExitDesertionDate
      }
    };
  }

  constructor(...args) {
    super(...args);

    const reasonForDivorceDesertionDateFields = [
      'reasonForDivorceDesertionDay',
      'reasonForDivorceDesertionMonth',
      'reasonForDivorceDesertionYear',
      'reasonForDivorceDesertionBeforeMarriage',
      'reasonForDivorceDesertionDateInFuture',
      'reasonForDivorceDesertionDate'
    ];

    watch('reasonForDivorce', (previousSession, session, remove) => {
      remove(...reasonForDivorceDesertionDateFields);
    });
  }


  interceptor(ctx, session) {
    if (utils.dateEmpty(ctx.reasonForDivorceDesertionDay, ctx.reasonForDivorceDesertionMonth, ctx.reasonForDivorceDesertionYear)) {
      delete ctx.reasonForDivorceDesertionDate;
      ctx.reasonForDivorceDesertionBeforeMarriage = false;
      ctx.reasonForDivorceDesertionAlright = false;
      ctx.reasonForDivorceDesertionDateInFuture = false;

      return ctx;
    }

    const desertionDate = moment(`${ctx.reasonForDivorceDesertionDay}/${ctx.reasonForDivorceDesertionMonth}/${ctx.reasonForDivorceDesertionYear}`, DATE_FORMAT);
    const twoYearsAgo = moment().subtract(TWO_YEARS, 'year')
      .subtract(1, 'days');

    ctx.reasonForDivorceDesertionDate = desertionDate.toISOString();
    //  reasonForDivorceDesertionBeforeMarriage error can only occur if user has filled marriage section
    ctx.reasonForDivorceDesertionBeforeMarriage = false;
    if (session.marriageDate) {
      ctx.reasonForDivorceDesertionBeforeMarriage = desertionDate.isBefore(
        session.marriageDate
      );
    }
    ctx.reasonForDivorceDesertionAlright = desertionDate.isBefore(twoYearsAgo);
    ctx.reasonForDivorceDesertionDateInFuture = desertionDate.diff(
      new Date()
    ) > 0;

    return ctx;
  }

  validate(ctx, session) {
    let [isValid, errors] = super.validate(ctx, session); // eslint-disable-line prefer-const

    if (!isValid) {
      if (some(errors, error => {
        return error.param === 'reasonForDivorceDesertionDate';
      })) {
        errors = filter(errors, error => {
          return !(/^day|month|year/.test(error.param));
        });
      }

      errors = map(errors, error => {
        if (error.param === 'reasonForDivorceDesertionBeforeMarriage' || error.param === 'reasonForDivorceDesertionDateInFuture') {
          error.param = 'reasonForDivorceDesertionDate';
        }
        return error;
      });
    }

    return [isValid, errors];
  }


  checkYourAnswersInterceptor(ctx) {
    const date = moment(`${ctx.reasonForDivorceDesertionDay}/${ctx.reasonForDivorceDesertionMonth}/${ctx.reasonForDivorceDesertionYear}`, DATE_FORMAT);
    ctx.reasonForDivorceDesertionDate = date.format('Do MMMM YYYY');
    return ctx;
  }
};

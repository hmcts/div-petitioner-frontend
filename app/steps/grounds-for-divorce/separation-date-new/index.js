const CONF = require('config');
const moment = require('moment');
const ValidationStep = require('app/core/steps/ValidationStep');
const utils = require('app/services/utils');
const { filter, some, isEmpty, map } = require('lodash');
const { watch } = require('app/core/helpers/staleDataManager');

const DATE_FORMAT = CONF.dateFormat;

const ONE_DAY = 1;
const TWO_YEARS = 2;
const FIVE_YEARS = 5;

module.exports = class SeparationDateNew extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/separation-dates';
  }
  get nextStep() {
    return {
      reasonForDivorceDecisionDateIsSameOrAfterLimitDate: {
        true: this.steps.ExitSeparation,
        false: {
          reasonForDivorceLivingApartDateIsSameOrAfterLimitDate: {
            true: this.steps.ExitSeparation,
            false: this.steps.LivedApartSince
          }
        }
      }
    };
  }

  constructor(...args) {
    super(...args);

    watch('reasonForDivorce', (previousSession, session, remove) => {
      if (session.reasonForDivorce !== 'separation-2-years' && session.reasonForDivorce !== 'separation-5-years') {
        remove(
          'reasonForDivorceDecisionDay',
          'reasonForDivorceDecisionMonth',
          'reasonForDivorceDecisionYear',
          'reasonForDivorceDecisionDate',
          'reasonForDivorceDecisionDateIsSameOrAfterLimitDate',
          'reasonForDivorceDecisionDateInFuture',
          'reasonForDivorceDecisionDateBeforeMarriageDate',
          'reasonForDivorceLivingApartDay',
          'reasonForDivorceLivingApartMonth',
          'reasonForDivorceLivingApartYear',
          'reasonForDivorceLivingApartDate',
          'reasonForDivorceLivingApartDateIsSameOrAfterLimitDate',
          'reasonForDivorceLivingApartDateInFuture',
          'reasonForDivorceLivingApartDateBeforeMarriageDate'
        );
      }
    });
  }

  interceptor(ctx, session) {
    this.validateDecisionDate(ctx, session);
    this.validateLivingApartDate(ctx, session);
    return ctx;
  }

  validateDecisionDate(ctx, session) {
    const invalidateContext = context => {
      context.reasonForDivorceDecisionDateIsSameOrAfterLimitDate = false;
      context.reasonForDivorceDecisionDateInFuture = false;
      context.reasonForDivorceDecisionDateBeforeMarriageDate = false;
    };

    if (utils.dateEmpty(ctx.reasonForDivorceDecisionDay, ctx.reasonForDivorceDecisionMonth, ctx.reasonForDivorceDecisionYear)) {
      delete ctx.reasonForDivorceDecisionDate;
      invalidateContext(ctx);
      return;
    }

    if (utils.partialDate(ctx.reasonForDivorceDecisionDay, ctx.reasonForDivorceDecisionMonth, ctx.reasonForDivorceDecisionYear)) {
      ctx.reasonForDivorceDecisionDate = moment().toISOString();
      invalidateContext(ctx);
      return;
    }

    const separationDate = this.getDecisionDate(ctx);
    ctx.reasonForDivorceDecisionDate = separationDate.toISOString();

    ctx.reasonForDivorceDecisionDateIsSameOrAfterLimitDate = this.isSameOrAfterLimitDate( // eslint-disable-line max-len
      separationDate,
      session.reasonForDivorce
    );

    ctx.reasonForDivorceDecisionDateInFuture = separationDate.isAfter(
      moment()
    );

    ctx.reasonForDivorceDecisionDateBeforeMarriageDate = this.isBeforeMarriageDate( // eslint-disable-line max-len
      session.marriageDate,
      separationDate
    );
  }

  validateLivingApartDate(ctx, session) {
    const invalidateContext = context => {
      context.reasonForDivorceLivingApartDateIsSameOrAfterLimitDate = false;
      context.reasonForDivorceLivingApartDateInFuture = false;
      context.reasonForDivorceLivingApartDateBeforeMarriageDate = false;
    };

    if (utils.dateEmpty(ctx.reasonForDivorceLivingApartDay,
      ctx.reasonForDivorceLivingApartMonth,
      ctx.reasonForDivorceLivingApartYear)) {
      delete ctx.reasonForDivorceLivingApartDate;
      invalidateContext(ctx);
      return;
    }

    if (utils.partialDate(ctx.reasonForDivorceLivingApartDay, ctx.reasonForDivorceLivingApartMonth, ctx.reasonForDivorceLivingApartYear)) {
      ctx.reasonForDivorceLivingApartDate = moment().toISOString();
      invalidateContext(ctx);
      return;
    }

    const separationDate = this.getLivingApartDate(ctx);
    ctx.reasonForDivorceLivingApartDate = separationDate.toISOString();

    ctx.reasonForDivorceLivingApartDateIsSameOrAfterLimitDate = this.isSameOrAfterLimitDate( // eslint-disable-line max-len
      separationDate,
      session.reasonForDivorce
    );

    ctx.reasonForDivorceLivingApartDateInFuture = separationDate.isAfter(
      moment()
    );

    ctx.reasonForDivorceLivingApartDateBeforeMarriageDate = this.isBeforeMarriageDate( // eslint-disable-line max-len
      session.marriageDate,
      separationDate
    );
  }

  isSameOrAfterLimitDate(separationDate, reasonForDivorce) {
    if (reasonForDivorce === 'separation-2-years') {
      return separationDate.isSameOrAfter(
        moment().subtract(TWO_YEARS, 'years')
          .subtract(ONE_DAY, 'days')
      );
    } else if (reasonForDivorce === 'separation-5-years') {
      return separationDate.isSameOrAfter(
        moment().subtract(FIVE_YEARS, 'years')
          .subtract(ONE_DAY, 'days')
      );
    }

    return false;
  }

  isBeforeMarriageDate(marriageDate, separationDate) {
    if (marriageDate) {
      return separationDate.isBefore(moment(marriageDate));
    }
    return false;
  }

  getDecisionDate(ctx) {
    return moment(`${ctx.reasonForDivorceDecisionDay}/${ctx.reasonForDivorceDecisionMonth}/${ctx.reasonForDivorceDecisionYear}`, DATE_FORMAT);
  }

  getLivingApartDate(ctx) {
    return moment(`${ctx.reasonForDivorceLivingApartDay}/${ctx.reasonForDivorceLivingApartMonth}/${ctx.reasonForDivorceLivingApartYear}`, DATE_FORMAT);
  }

  validate(ctx, session) {
    let [isValid, errors] = super.validate(ctx, session); // eslint-disable-line prefer-const

    if (!isEmpty(errors)) {
      if (some(errors, error => {
        return error.param === 'reasonForDivorceDecisionDate' || error.param === 'reasonForDivorceLivingApartDate';
      })) {
        errors = filter(errors, error => {
          return !(/^day|month|year/.test(error.param));
        });
      }

      errors = map(errors, error => {
        if (error.param === 'reasonForDivorceDecisionDateInFuture' || error.param === 'reasonForDivorceDecisionDateBeforeMarriageDate') {
          error.param = 'reasonForDivorceDecisionDate';
        }
        if (error.param === 'reasonForDivorceLivingApartDateInFuture' || error.param === 'reasonForDivorceLivingApartDateBeforeMarriageDate') {
          error.param = 'reasonForDivorceLivingApartDate';
        }
        return error;
      });
    }

    return [isValid, errors];
  }

  action(ctx, session) {
    if (ctx.reasonForDivorceDecisionDateIsSameOrAfterLimitDate) {
      session.reasonForDivorceDecisionDay = '';
      session.reasonForDivorceDecisionMonth = '';
      session.reasonForDivorceDecisionYear = '';
      session.reasonForDivorceDecisionDate = '';
      ctx.reasonForDivorceDecisionDay = '';
      ctx.reasonForDivorceDecisionMonth = '';
      ctx.reasonForDivorceDecisionYear = '';
      ctx.reasonForDivorceDecisionDate = '';
    }

    if (ctx.reasonForDivorceLivingApartDateIsSameOrAfterLimitDate) {
      session.reasonForDivorceLivingApartDay = '';
      session.reasonForDivorceLivingApartMonth = '';
      session.reasonForDivorceLivingApartYear = '';
      session.reasonForDivorceLivingApartDate = '';
      ctx.reasonForDivorceLivingApartDay = '';
      ctx.reasonForDivorceLivingApartMonth = '';
      ctx.reasonForDivorceLivingApartYear = '';
      ctx.reasonForDivorceLivingApartDate = '';
    }

    return [ctx, session];
  }

  checkYourAnswersInterceptor(ctx) {
    const cyaDateFormat = 'Do MMMM YYYY';

    const decisionDate = this.getDecisionDate(ctx);
    ctx.reasonForDivorceDecisionDate = decisionDate.format(cyaDateFormat);

    const livingApartDate = this.getLivingApartDate(ctx);
    ctx.reasonForDivorceLivingApartDate = livingApartDate.format(cyaDateFormat);

    return ctx;
  }
};

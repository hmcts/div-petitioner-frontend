const CONF = require('config');
const moment = require('moment');
const ValidationStep = require('app/core/steps/ValidationStep');
const utils = require('app/services/utils');
const { filter, some, isEmpty, map } = require('lodash');
const { watch } = require('app/core/helpers/staleDataManager');

const DATE_FORMAT = CONF.dateFormat;

const TWO_YEARS = 2;
const FIVE_YEARS = 5;

module.exports = class SeparationDate extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/separated';
  }
  get nextStep() {
    return {
      reasonForDivorceSeperationDateIsSameOrAfterLimitDate: {
        true: this.steps.ExitSeparation,
        false: this.steps.LegalProceedings
      }
    };
  }

  constructor(...args) {
    super(...args);

    watch('reasonForDivorce', (previousSession, session, remove) => {
      if (session.reasonForDivorce !== 'separation-2-years' && session.reasonForDivorce !== 'separation-5-years') {
        remove(
          'reasonForDivorceSeperationDay',
          'reasonForDivorceSeperationMonth',
          'reasonForDivorceSeperationYear',
          'reasonForDivorceSeperationDate',
          'reasonForDivorceSeperationDateIsSameOrAfterLimitDate',
          'reasonForDivorceSeperationDateInFuture',
          'reasonForDivorceSeperationDateBeforeMarriageDate'
        );
      }
    });
  }

  interceptor(ctx, session) {
    if (utils.dateEmpty(ctx.reasonForDivorceSeperationDay, ctx.reasonForDivorceSeperationMonth, ctx.reasonForDivorceSeperationYear)) {
      delete ctx.reasonForDivorceSeperationDate;
      ctx.reasonForDivorceSeperationDateIsSameOrAfterLimitDate = false;
      ctx.reasonForDivorceSeperationDateInFuture = false;
      ctx.reasonForDivorceSeperationDateBeforeMarriageDate = false;
      return ctx;
    }

    if (utils.partialDate(ctx.reasonForDivorceSeperationDay, ctx.reasonForDivorceSeperationMonth, ctx.reasonForDivorceSeperationYear)) {
      ctx.reasonForDivorceSeperationDate = moment().toISOString();
      ctx.reasonForDivorceSeperationDateIsSameOrAfterLimitDate = false;
      ctx.reasonForDivorceSeperationDateInFuture = false;
      ctx.reasonForDivorceSeperationDateBeforeMarriageDate = false;
      return ctx;
    }

    const separationDate = moment(`${ctx.reasonForDivorceSeperationDay}/${ctx.reasonForDivorceSeperationMonth}/${ctx.reasonForDivorceSeperationYear}`, DATE_FORMAT);
    ctx.reasonForDivorceSeperationDate = separationDate.toISOString();

    const reasonForDivorce = session.reasonForDivorce;
    if (reasonForDivorce === 'separation-2-years') {
      ctx.reasonForDivorceSeperationDateIsSameOrAfterLimitDate = separationDate.isSameOrAfter( // eslint-disable-line max-len
        moment().subtract(TWO_YEARS, 'years')
          .subtract(1, 'days')
      );
    } else if (reasonForDivorce === 'separation-5-years') {
      ctx.reasonForDivorceSeperationDateIsSameOrAfterLimitDate = separationDate.isSameOrAfter( // eslint-disable-line max-len
        moment().subtract(FIVE_YEARS, 'years')
          .subtract(1, 'days')
      );
    }

    ctx.reasonForDivorceSeperationDateInFuture = separationDate.isAfter(
      moment()
    );

    if (session.marriageDate) {
      ctx.reasonForDivorceSeperationDateBeforeMarriageDate = separationDate.isBefore( // eslint-disable-line max-len
        moment(session.marriageDate)
      );
    } else {
      ctx.reasonForDivorceSeperationDateBeforeMarriageDate = false;
    }

    return ctx;
  }

  validate(ctx, session) {
    let [isValid, errors] = super.validate(ctx, session); // eslint-disable-line prefer-const

    if (!isEmpty(errors)) {
      if (some(errors, error => {
        return error.param === 'reasonForDivorceSeperationDate';
      })) {
        errors = filter(errors, error => {
          return !(/^day|month|year/.test(error.param));
        });
      }

      errors = map(errors, error => {
        if (error.param === 'reasonForDivorceSeperationDateInFuture' || error.param === 'reasonForDivorceSeperationDateBeforeMarriageDate') {
          error.param = 'reasonForDivorceSeperationDate';
        }
        return error;
      });
    }

    return [isValid, errors];
  }

  action(ctx, session) {
    if (ctx.reasonForDivorceSeperationDateIsSameOrAfterLimitDate) {
      session.reasonForDivorceSeperationDay = '';
      session.reasonForDivorceSeperationMonth = '';
      session.reasonForDivorceSeperationYear = '';
      session.reasonForDivorceSeperationDate = '';
      ctx.reasonForDivorceSeperationDay = '';
      ctx.reasonForDivorceSeperationMonth = '';
      ctx.reasonForDivorceSeperationYear = '';
      ctx.reasonForDivorceSeperationDate = '';
    }

    return [ctx, session];
  }

  checkYourAnswersInterceptor(ctx) {
    const seperationDate = moment(`${ctx.reasonForDivorceSeperationDay}/${ctx.reasonForDivorceSeperationMonth}/${ctx.reasonForDivorceSeperationYear}`, DATE_FORMAT);
    ctx.reasonForDivorceSeperationDate = seperationDate.format('Do MMMM YYYY');
    return ctx;
  }
};

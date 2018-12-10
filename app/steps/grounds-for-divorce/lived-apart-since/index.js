const CONF = require('config');
const moment = require('moment');
const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');
const config = require('config');
const parseBool = require('app/core/utils/parseBool');

const constants = {
  two: '2',
  five: '5',
  sep2yrs: 'separation-2-years',
  sep5yrs: 'separation-5-years'
};

module.exports = class LivedApartSince extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/separation/lived-apart-since';
  }
  get nextStep() {
    return {
      reasonForDivorceLivingApartEntireTime: {
        Yes: this.steps.LegalProceedings,
        No: {
          reasonForDivorceLivingTogetherMoreThan6Months: {
            Yes: this.steps.SeparationSixMonthPeriod,
            No: this.steps.LegalProceedings
          }
        }
      }
    };
  }

  constructor(...args) {
    super(...args);

    if (parseBool(config.features.release510)) {
      watch('reasonForDivorce', (previousSession, session, remove) => {
        remove('reasonForDivorceLivingApartEntireTime',
                'reasonForDivorceLivingTogetherMoreThan6Months',
                'sepYears',
                'permittedSepDate',
                'livingTogetherMonths',
                'livingTogetherWeeks',
                'livingTogetherDays',
                'liveTogetherPeriodRemainingDays',
                'sepStartDate');
      });

      watch('reasonForDivorceLivingApartEntireTime', (previousSession, session, remove) => {
        if (session.reasonForDivorceLivingApartEntireTime === 'Yes') {
          remove('reasonForDivorceLivingTogetherMoreThan6Months');
        }
      });
    }
  }

  interceptor(ctx, session) {
    ctx.sepYears = this.getSepYears(session.reasonForDivorce);

    ctx.permittedSepDate = this.getPermittedSepDate(
      session.reasonForDivorce
    );

    ctx.livingTogetherMonths = this.getLivingTogetherMonths(
      session.reasonForDivorce,
      session.reasonForDivorceLivingApartDate
    );

    ctx.livingTogetherWeeks = this.getLivingTogetherWeeks(
      session.reasonForDivorce,
      session.reasonForDivorceLivingApartDate
    );

    ctx.livingTogetherDays = this.getLivingTogetherDays(
      session.reasonForDivorce,
      session.reasonForDivorceLivingApartDate
    );

    ctx.liveTogetherPeriodRemainingDays = this.getLiveTogetherPeriodRemainingDays(
      session.reasonForDivorce,
      session.reasonForDivorceLivingApartDate
    );

    ctx.sepStartDate = this.getSepStartDate(
      session.reasonForDivorce
    );

    ctx.mostRecentSeparationDate = this.getMostRecentSeparationDate(
      session.reasonForDivorceLivingApartDate,
      session.reasonForDivorceDecisionDate
    );

    return ctx;
  }

  getSepYears(reasonForDivorce) {
    let sepYears = '0';
    if (reasonForDivorce === constants.sep2yrs) {
      sepYears = constants.two;
    } else if (reasonForDivorce === constants.sep5yrs) {
      sepYears = constants.five;
    }
    return sepYears;
  }

  getPermittedSepDate(reasonForDivorce) {
    return moment().subtract(this.getSepYears(reasonForDivorce), 'years');
  }

  getLivingTogetherMonths(reasonForDivorce, reasonForDivorceLivingApartDate) {
    return moment(this.getPermittedSepDate(reasonForDivorce)).diff(moment(reasonForDivorceLivingApartDate), 'months');
  }

  getLivingTogetherWeeks(reasonForDivorce, reasonForDivorceLivingApartDate) {
    return moment(this.getPermittedSepDate(reasonForDivorce)).diff(moment(reasonForDivorceLivingApartDate), 'weeks');
  }

  getLivingTogetherDays(reasonForDivorce, reasonForDivorceLivingApartDate) {
    return moment(this.getPermittedSepDate(reasonForDivorce)).diff(moment(reasonForDivorceLivingApartDate), 'days');
  }

  getLiveTogetherPeriodRemainingDays(reasonForDivorce, reasonForDivorceLivingApartDate) {
    return this.getLivingTogetherDays(reasonForDivorce, reasonForDivorceLivingApartDate) % 7;
  }

  getSepStartDate(reasonForDivorce) {
    return moment().subtract(this.getSepYears(reasonForDivorce), 'years').subtract(6, 'months').format('DD MMMM YYYY');
  }

  getMostRecentSeparationDate(reasonForDivorceLivingApartDate, reasonForDivorceDecisionDate) {
    return moment()
  }
};

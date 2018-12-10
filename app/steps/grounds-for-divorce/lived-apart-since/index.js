const moment = require('moment');
const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');
const config = require('config');
const parseBool = require('app/core/utils/parseBool');

const constants = {
  two: '2',
  five: '5',
  sep2yrs: 'separation-2-years',
  sep5yrs: 'separation-5-years',
  dateFormat: 'DD MMMM YYYY',
  six: '6',
  seven: '7'
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
    ctx.sepYears = this.getSepYears(session);
    ctx.permittedSepDate = this.getPermittedSepDate(session);
    ctx.livingTogetherMonths = this.getLivingTogetherMonths(session);
    ctx.livingTogetherWeeks = this.getLivingTogetherWeeks(session);
    ctx.livingTogetherDays = this.getLivingTogetherDays(session);
    ctx.liveTogetherPeriodRemainingDays = this.getLiveTogetherPeriodRemainingDays(session); // eslint-disable-line 
    ctx.sepStartDate = this.getSepStartDate(session);
    ctx.mostRecentSeparationDate = this.formattedMostRecentSepDate(session);

    return ctx;
  }

  getSepYears(session) {
    let sepYears = '0';
    if (session.reasonForDivorce === constants.sep2yrs) {
      sepYears = constants.two;
    } else if (session.reasonForDivorce === constants.sep5yrs) {
      sepYears = constants.five;
    }
    return sepYears;
  }

  getPermittedSepDate(session) {
    return moment().subtract(this.getSepYears(session), 'years');
  }

  getLivingTogetherMonths(session) {
    return moment(this.getPermittedSepDate(session)).diff(moment(this.getMostRecentSeparationDate(session)), 'months');
  }

  getLivingTogetherWeeks(session) {
    return moment(this.getPermittedSepDate(session)).diff(moment(this.getMostRecentSeparationDate(session)), 'weeks');
  }

  getLivingTogetherDays(session) {
    return moment(this.getPermittedSepDate(session)).diff(moment(this.getMostRecentSeparationDate(session)), 'days');
  }

  getLiveTogetherPeriodRemainingDays(session) {
    return this.getLivingTogetherDays(session) % constants.seven;
  }

  getSepStartDate(session) {
    return moment().subtract(this.getSepYears(session), 'years')
      .subtract(constants.six, 'months')
      .format('DD MMMM YYYY');
  }


  getMostRecentSeparationDate(session) {
    if (moment(session.reasonForDivorceDecisionDate) > moment(session.reasonForDivorceLivingApartDate)) {
      return session.reasonForDivorceDecisionDate;
    }
    return session.reasonForDivorceLivingApartDate;
  }

  formattedMostRecentSepDate(session) {
    return moment(this.getMostRecentSeparationDate(session)).format(constants.dateFormat); // eslint-disable-line 
  }
};

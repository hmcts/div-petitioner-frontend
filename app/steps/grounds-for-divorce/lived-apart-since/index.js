const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');
const config = require('config');
const parseBool = require('app/core/utils/parseBool');

const {
  getSepYears, getPermittedSepDate, getLivingTogetherMonths,
  getLivingTogetherWeeks, getLivingTogetherDays,
  getLiveTogetherPeriodRemainingDays,
  getSepStartDate, formattedMostRecentSepDate
} = require('app/services/separationDates');

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
            Yes: this.steps.ExitSeparation,
            No: this.steps.LegalProceedings
          }
        }
      }
    };
  }

  constructor(...args) {
    super(...args);

    if (parseBool(config.features.release510)) {
      watch([
        'reasonForDivorceDecisionDateIsSameOrAfterLimitDate',
        'reasonForDivorceLivingApartDateIsSameOrAfterLimitDate'
      ], (previousSession, session, remove) => {
        remove('reasonForDivorceLivingApartEntireTime',
          'reasonForDivorceLivingTogetherMoreThan6Months'
        );
      });

      watch('reasonForDivorceLivingApartEntireTime', (previousSession, session, remove) => {
        if (session.reasonForDivorceLivingApartEntireTime === 'Yes') {
          remove('reasonForDivorceLivingTogetherMoreThan6Months');
        }
      });
    }
  }

  interceptor(ctx, session) {
    ctx.sepYears = getSepYears(session);
    ctx.permittedSepDate = getPermittedSepDate(session);
    ctx.livingTogetherMonths = getLivingTogetherMonths(session);
    ctx.livingTogetherWeeks = getLivingTogetherWeeks(session);
    ctx.livingTogetherDays = getLivingTogetherDays(session);
    ctx.liveTogetherPeriodRemainingDays = getLiveTogetherPeriodRemainingDays(session); // eslint-disable-line 
    ctx.sepStartDate = getSepStartDate(session);
    ctx.mostRecentSeparationDate = formattedMostRecentSepDate(session);

    return ctx;
  }
};
const Step = require('app/core/steps/Step');

const {
  getSepYears, getLivingTogetherMonths,
  getLivingTogetherWeeks, getLivingTogetherDays,
  getLiveTogetherPeriodRemainingDays,
  getReferenceDate, formattedMostRecentSepDate,
  getSeparationTimeTogetherPermitted
} = require('app/services/separationDates');

module.exports = class ExitSixMonthRule extends Step {
  get url() {
    return '/exit/statement-of-case/separation-six-month-period';
  }

  get nextStep() {
    return null;
  }

  interceptor(ctx, session) {
    ctx.limitYears = getSepYears(session);
    ctx.livingTogetherMonths = getLivingTogetherMonths(session);
    ctx.livingTogetherWeeks = getLivingTogetherWeeks(session);
    ctx.livingTogetherDays = getLivingTogetherDays(session);
    ctx.liveTogetherPeriodRemainingDays = getLiveTogetherPeriodRemainingDays(session); // eslint-disable-line 
    ctx.referenceDate = getReferenceDate(session);
    ctx.mostRecentSeparationDate = formattedMostRecentSepDate(session);
    ctx.separationTimeTogetherPermitted = getSeparationTimeTogetherPermitted(session); // eslint-disable-line 

    return ctx;
  }
};

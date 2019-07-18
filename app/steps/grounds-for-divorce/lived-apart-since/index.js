const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

const {
  getSepYears, getLivingTogetherMonths,
  getLivingTogetherWeeks, getLivingTogetherDays,
  getLiveTogetherPeriodRemainingDays,
  getReferenceDate, formattedMostRecentSepDate,
  getSeparationTimeTogetherPermitted
} = require('app/services/separationDates');

module.exports = class LivedApartSince extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/separation/lived-apart-since';
  }

  get nextStep() {
    return {
      reasonForDivorceField: {
        desertion: {
          livedApartEntireTime: {
            Yes: this.steps.DesertionDetails,
            No: {
              livedTogetherMoreTimeThanPermitted: {
                Yes: this.steps.ExitSixMonthRule,
                No: this.steps.DesertionDetails
              }
            }
          }
        },
        separation: {
          livedApartEntireTime: {
            Yes: this.steps.LegalProceedings,
            No: {
              livedTogetherMoreTimeThanPermitted: {
                Yes: this.steps.ExitSixMonthRule,
                No: this.steps.LegalProceedings
              }
            }
          }
        }
      }
    };
  }

  constructor(...args) {
    super(...args);

    const thisStepFields = [
      'sepYears',
      'livingTogetherMonths',
      'livingTogetherWeeks',
      'livingTogetherDays',
      'liveTogetherPeriodRemainingDays',
      'referenceDate',
      'mostRecentSeparationDate',
      'separationTimeTogetherPermitted',
      'reasonForDivorceField',
      'livedApartEntireTime',
      'livedTogetherMoreTimeThanPermitted'
    ];

    watch(['reasonForDivorceLivingApartDateIsSameOrAfterLimitDate'], (previousSession, session, remove) => {
      const isSameOrAfterLimitDateDoesNotExsits = !session.hasOwnProperty('reasonForDivorceLivingApartDateIsSameOrAfterLimitDate');
      const isSameOrAfterLimitDateIsTrue = session.reasonForDivorceLivingApartDateIsSameOrAfterLimitDate && session.reasonForDivorceLivingApartDateIsSameOrAfterLimitDate === true;

      if (isSameOrAfterLimitDateDoesNotExsits || isSameOrAfterLimitDateIsTrue) {
        remove(...thisStepFields);
      }
    });

    watch(['reasonForDivorce'], (previousSession, session, remove) => {
      remove(...thisStepFields);
    });
  }

  interceptor(ctx, session) {
    ctx.sepYears = getSepYears(session);
    ctx.livingTogetherMonths = getLivingTogetherMonths(session);
    ctx.livingTogetherWeeks = getLivingTogetherWeeks(session);
    ctx.livingTogetherDays = getLivingTogetherDays(session);
    ctx.liveTogetherPeriodRemainingDays = getLiveTogetherPeriodRemainingDays(session); // eslint-disable-line
    ctx.referenceDate = getReferenceDate(session);
    ctx.mostRecentSeparationDate = formattedMostRecentSepDate(session);
    ctx.separationTimeTogetherPermitted = getSeparationTimeTogetherPermitted(session); // eslint-disable-line
    ctx.reasonForDivorceField = session.reasonForDivorce === 'desertion' ? 'desertion' : 'separation';

    return ctx;
  }
};

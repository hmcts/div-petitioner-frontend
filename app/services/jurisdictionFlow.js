const { nextStepsMap } = require('app/services/jurisdictionStepMap');

// @todo Refactor this to reduce complexity.
const getJurisdictionNextStep = (currentStep, context, session) => { // eslint-disable-line complexity
  const steps = currentStep.steps;

  const createEnum = stepsList => {
    const arr = Object.keys(stepsList);
    const stepEnum = {};

    for (const i in arr) {
      if (i) {
        stepEnum[arr[i]] = arr[i];
      }
    }

    return stepEnum;
  };

  const step = createEnum(steps);

  const jurisdictionResidence = context.jurisdictionResidence || session.jurisdictionResidence;
  const jurisdictionDomicile = context.jurisdictionDomicile || session.jurisdictionDomicile;
  let jurisdictionLast12Months = context.jurisdictionLast12Months || session.jurisdictionLast12Months;
  let jurisdictionLast6Months = context.jurisdictionLast6Months || session.jurisdictionLast6Months;

  if (jurisdictionLast12Months) {
    jurisdictionLast12Months = jurisdictionLast12Months.toLowerCase();
  }

  if (jurisdictionLast6Months) {
    jurisdictionLast6Months = jurisdictionLast6Months.toLowerCase();
  }

  if (jurisdictionResidence && jurisdictionDomicile) {
    switch (currentStep.constructor.name) {
    case 'JurisdictionLast12Months':
      return nextStepsMap(step)[jurisdictionResidence][jurisdictionDomicile][jurisdictionLast12Months].step; // eslint-disable-line max-len

    case 'JurisdictionLast6Months':
      return nextStepsMap(step)[jurisdictionResidence][jurisdictionDomicile][jurisdictionLast12Months][jurisdictionLast6Months].step; // eslint-disable-line max-len

    default:
      return nextStepsMap(step)[jurisdictionResidence][jurisdictionDomicile].step; // eslint-disable-line max-len
    }
  }

  return {};
};

module.exports = getJurisdictionNextStep;

const { isEmpty, cloneDeep } = require('lodash');
const getJurisdictionContent = require('app/services/jurisdiction/jurisdictionContent');
const { removeStaleData } = require('app/core/helpers/staleDataManager');

const datePeriod = require('app/core/utils/datePeriod');

const isHabitualResident = (who, step, ctx, session) => {
  const stepData = (step === 'JurisdictionHabitualResidence') ? ctx : session;
  return stepData[`jurisdiction${who.charAt(0).toUpperCase()}${who.slice(1)}Residence`] === 'Yes';
};

const isDomiciled = (who, step, ctx, session) => {
  const stepData = (step === 'JurisdictionDomicile') ? ctx : session;
  return stepData[`jurisdiction${who.charAt(0).toUpperCase()}${who.slice(1)}Domicile`] === 'Yes';
};

const residualJurisdiction = (step, ctx, session) => {
  const stepData = (step === 'JurisdictionResidual') ? ctx : session;
  return stepData.residualJurisdictionEligible === 'Yes';
};

const isEitherDomiciled = (step, ctx, session) => {
  return isDomiciled('petitioner', step, ctx, session) || isDomiciled('respondent', step, ctx, session);
};

const areBothHabituallyResident = (step, ctx, session) => {
  return isHabitualResident('petitioner', step, ctx, session) && isHabitualResident('respondent', step, ctx, session);
};

const areBothDomiciled = (step, ctx, session) => {
  return isDomiciled('petitioner', step, ctx, session) && isDomiciled('respondent', step, ctx, session);
};

const areBothNotDomiciled = (step, ctx, session) => {
  return !isDomiciled('petitioner', step, ctx, session) && !isDomiciled('respondent', step, ctx, session);
};

const hasLivedMonths = (months, step, ctx, session) => {
  const stepData = (ctx[`jurisdictionLast${months === datePeriod.SIX_MONTHS ? 'Six' : 'Twelve'}Months`]) ? ctx : session;

  return stepData[`jurisdictionLast${months === datePeriod.SIX_MONTHS ? 'Six' : 'Twelve'}Months`] === 'Yes';
};

const areBothLastHabitualResident = (step, ctx, session) => {
  const stepData = (step === 'JurisdictionLastHabitualResidence') ? ctx : session;
  return stepData.jurisdictionLastHabitualResident === 'Yes';
};

const isPetitionerHabitualAndDomiciled = (step, ctx, session) => {
  return isHabitualResident('petitioner', step, ctx, session) && isDomiciled('petitioner', step, ctx, session);
};

const hasLivedAtLeastSixMonths = (step, ctx, session) => {
  return hasLivedMonths(datePeriod.TWELVE_MONTHS, step, ctx, session) || hasLivedMonths(datePeriod.SIX_MONTHS, step, ctx, session);
};

const getConnectionLetter = (step, ctx, session, petitionerConnections, c) => { // eslint-disable-line complexity
  switch (c) {
  case 'A':
    if (areBothHabituallyResident(step, ctx, session)) {
      return c;
    }
    break;
  case 'B':
    if (isEmpty(petitionerConnections) && areBothLastHabitualResident(step, ctx, session)) {
      return c;
    }
    break;
  case 'C':
    if (isHabitualResident('respondent', step, ctx, session)) {
      return c;
    }
    break;
  case 'D':
    if (hasLivedMonths(datePeriod.TWELVE_MONTHS, step, ctx, session)) {
      return c;
    }
    break;
  case 'E':
    if (isPetitionerHabitualAndDomiciled(step, ctx, session) && hasLivedAtLeastSixMonths(step, ctx, session)) {
      return c;
    }
    break;
  case 'F':
    if (areBothDomiciled(step, ctx, session)) {
      return c;
    }
    break;
  case 'G':
    if (residualJurisdiction(step, ctx, session)) {
      return c;
    }
    break;
  default:
    break;
  }
  return false;
};

const generationConnections = (step, ctx, session) => {
  const allConnections = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  return allConnections.reduce((petitionerConnections, c) => {
    const letter = getConnectionLetter(
      step, ctx, session, petitionerConnections, c
    );
    return letter ? petitionerConnections.concat(letter) : petitionerConnections;
  }, []);
};

const applyConnectionsText = (step, ctx, session) => {
  const jurisdictionConnection = session.jurisdictionConnection;
  const contextAndSession = Object.assign({}, session, ctx);
  const content = getJurisdictionContent(contextAndSession);
  const connections = {};

  for (const con in jurisdictionConnection) {
    if (con) {
      connections[jurisdictionConnection[con]] = content[`legal${[jurisdictionConnection[con]]}`];
    }
  }
  Object.assign(session, { connections });
};

const applyConnections = (step, ctx, session) => {
  const lastResortConnections = session.jurisdictionLastResortConnections || ctx.jurisdictionLastResortConnections;
  session.jurisdictionConnection = [];

  let petitionerConnections = [];

  // only generate connections if lastResortConnections is not set
  if (lastResortConnections) {
    petitionerConnections = lastResortConnections;
  } else {
    petitionerConnections = generationConnections(step, ctx, session);
  }

  Object.assign(session.jurisdictionConnection, petitionerConnections);
  Array.from(new Set(session.jurisdictionConnection));

  applyConnectionsText(step, ctx, session);
};

const clearJurisdictionSections = session => {
  const keysToDelete = [
    'jurisdictionPetitionerDomicile',
    'jurisdictionRespondentDomicile', 'jurisdictionLastHabitualResident',
    'jurisdictionConnection', 'jurisdictionConfidentLegal', 'jurisdictionConnectionFirst',
    'jurisdictionLastTwelveMonths', 'jurisdictionLastSixMonths', 'residualJurisdictionEligible',
    'connections'
  ];
  keysToDelete.forEach(juri => {
    delete session[juri];
  });
};

const hasOnlyConnection = (connections, connection) => {
  return connections.length === 1 && connections.includes(connection);
};

const clearProceedingSteps = (originalSession, step) => {
  let session = originalSession;

  if (!session.jurisdictionPath) {
    session.jurisdictionPath = [];
  }

  // clone the previous session to use when triggering watches
  const previousSession = cloneDeep(session);

  // the get the index of the current step in the path ( will only return if user has been here before)
  const currentStepIndex = session.jurisdictionPath.indexOf(step.name);

  // if user has been here before, clear out any data in proceeding steps
  // this is to ensure correct nextStep routing as logic for the next step
  // can be based on answers from future questions ( which if the user has
  // navigated back could have answered)
  if (currentStepIndex !== -1) {
    // get list of paths to remove
    const jurisdictionPathsToRemove = session.jurisdictionPath.slice(
      currentStepIndex
    );
    // remove any paths after the current step
    session.jurisdictionPath = session.jurisdictionPath.slice(
      0, currentStepIndex
    );

    // loop through each future step the user has answerd and clear out
    // all of the values form the session
    jurisdictionPathsToRemove.forEach(stepName => {
      const properties = Object.keys(step.steps[stepName].properties);
      properties.forEach(property => {
        delete session[property];
      });
    });

    session = removeStaleData(previousSession, session);
  }

  session.jurisdictionPath.push(step.name);
};

module.exports = {
  applyConnections,
  isHabitualResident,
  areBothHabituallyResident,
  hasLivedMonths,
  isDomiciled,
  residualJurisdiction,
  isEitherDomiciled,
  areBothDomiciled,
  areBothNotDomiciled,
  areBothLastHabitualResident,
  clearJurisdictionSections,
  hasOnlyConnection,
  clearProceedingSteps
};

const { isEmpty, isEqual } = require('lodash');

const caseStates = {
  AwaitingAmendCase: 'AwaitingAmendCase'
};

const caseInState = (sessionData, caseState) => {
  if (isEmpty(caseState) || isEmpty(sessionData.state)) {
    return false;
  }
  return isEqual(sessionData.state, caseState);
};

module.exports = {
  caseInState,
  caseStates
};

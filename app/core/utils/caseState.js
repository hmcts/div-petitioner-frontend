const { isEmpty, isEqual, get } = require('lodash');

const caseStates = {
  AwaitingAmendCase: 'AwaitingAmendCase'
};

const isAwaitingAmendCase = sessionData => {
  const state = get(sessionData, 'state');
  if (isEmpty(state)) {
    return false;
  }
  return isEqual(state, caseStates.AwaitingAmendCase);
};

module.exports = {
  isAwaitingAmendCase
};

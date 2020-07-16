const { isEmpty, isEqual, get } = require('lodash');

const caseStates = {
  AwaitingAmendCase: 'AwaitingAmendCase'
};

const isToggleOn = session => {
  const toggle = get(session, 'featureToggles', { ft_awaiting_amend: false });
  return toggle.ft_awaiting_amend;
};

const isAwaitingAmendCase = sessionData => {
  if (!isToggleOn(sessionData)) {
    return false;
  }

  const state = get(sessionData, 'state');
  if (isEmpty(state)) {
    return false;
  }

  return isEqual(state, caseStates.AwaitingAmendCase);
};

module.exports = {
  isAwaitingAmendCase
};

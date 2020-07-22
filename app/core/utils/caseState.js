const { isEmpty, isEqual, get } = require('lodash');

const awaitingAmendCase = 'AwaitingAmendCase';

const isToggleOn = session => {
  const toggle = get(session, 'featureToggles', { ft_awaiting_amend: false });
  return toggle.ft_awaiting_amend;
};

const isAwaitingAmendCase = sessionData => {
  if (!isToggleOn(sessionData)) {
    return false;
  }
  const currentState = get(sessionData, 'state');
  if (isEmpty(currentState)) {
    return false;
  }
  return isEqual(currentState, awaitingAmendCase);
};

module.exports = {
  isAwaitingAmendCase
};

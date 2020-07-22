const { isEmpty, isEqual, get } = require('lodash');
const logger = require('app/services/logger').logger(__filename);

const awaitingAmendCase = 'AwaitingAmendCase';

const isToggleOn = session => {
  const toggle = get(session, 'featureToggles', { ft_awaiting_amend: false });
  return toggle.ft_awaiting_amend;
};

const isAwaitingAmendCase = sessionData => {
  logger.infoWithReq(sessionData.req, 'checking_awaiting_amend_state',
    'Checking if the case state is awaiting amend');
  if (!isToggleOn(sessionData)) {
    logger.infoWithReq(sessionData.req, 'checking_awaiting_amend_state',
      'Awaiting amend state toggle is off');
    return false;
  }
  logger.infoWithReq(sessionData.req, 'checking_awaiting_amend_state',
    'Awaiting amend state toggle is on');
  const currentState = get(sessionData, 'state');
  if (isEmpty(currentState)) {
    return false;
  }
  return isEqual(currentState, awaitingAmendCase);
};

module.exports = {
  isAwaitingAmendCase
};

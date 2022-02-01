const { get } = require('lodash');

const isToggleOnAwaitingAmend = session => {
  const toggle = get(session, 'featureToggles', { ft_awaiting_amend: false });
  return toggle.ft_awaiting_amend;
};

const isToggleOnRepresentedRespondentJourney = session => {
  const toggle = get(session, 'featureToggles', { ft_represented_respondent_journey: false });
  return toggle.ft_represented_respondent_journey;
};

module.exports = {
  isToggleOnAwaitingAmend,
  isToggleOnRepresentedRespondentJourney
};

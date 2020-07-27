const { get } = require('lodash');

const isToggleOnAwaitingAmend = session => {
  const toggle = get(session, 'featureToggles', { ft_awaiting_amend: false });
  return toggle.ft_awaiting_amend;
};

module.exports = {
  isToggleOnAwaitingAmend
};

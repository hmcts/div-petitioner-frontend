'use strict';
const requireDirectory = require('require-directory'),
  steps = requireDirectory(module);

const actions = {};

function setActorActions(data) {
  for (const k in data) {
    // eslint-disable-next-line no-prototype-builtins
    if (data.hasOwnProperty(k)) {
      actions[k] = data[k];
    }
  }
}

module.exports = function() {
  const stepsKeys = Object.keys(steps);

  for (const step in stepsKeys) {
    const sectionKeys = Object.keys(steps[stepsKeys[step]]);

    for (const section in sectionKeys) {
      setActorActions(steps[stepsKeys[step]][sectionKeys[section]]);
    }
  }

  return actor(actions);
};
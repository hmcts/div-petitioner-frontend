const forEach = require('mocha-each');
const { invoke } = require('lodash');
const { expect } = require('test/util/chai');

const checkToggle = require('app/core/utils/checkToggle');

const buildSessionWithFeatureToggle = (featureName, featureValue) => {
  const featureToggles = {};
  featureToggles[featureName] = featureValue;
  return { featureToggles };
};

describe('checkToggle', () => {
  forEach([
    ['ft_awaiting_amend', 'isToggleOnAwaitingAmend'],
    ['ft_represented_respondent_journey', 'isToggleOnRepresentedRespondentJourney']
  ])
    .describe('%s', (featureToggleName, featureToggleMethod) => {
      it(`should return true when ${featureToggleName} toggle is on`, () => {
        const session = buildSessionWithFeatureToggle(featureToggleName, true);
        expect(invoke(checkToggle, featureToggleMethod, session)).to.equal(true);
      });

      it(`should return false when ${featureToggleName} toggle is off`, () => {
        const session = buildSessionWithFeatureToggle(featureToggleName, false);
        expect(invoke(checkToggle, featureToggleMethod, session)).to.equal(false);
      });

      it(`should return false when ${featureToggleName} toggle does not exist in session`, () => {
        expect(invoke(checkToggle, featureToggleMethod, {})).to.equal(false);
      });
    });
});

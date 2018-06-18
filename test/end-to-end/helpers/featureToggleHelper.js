'use strict';

const CONF = require('config');
let Helper = codecept_helper;
const { get, features } = require('@hmcts/div-feature-toggle-client')({
  env: CONF.defaultEnvironmentNodeEnv || CONF.environment,
  featureToggleApiUrl: CONF.services.featureToggleApiUrl
}).featureToggles;
let toggleStore = require('test/end-to-end/helpers/featureToggleStore.js');

class FeatureToggleHelper extends Helper {

  _beforeSuite() {
    const toggle = 'idam';

    return this.getFeatureEnabled(toggle).then((res) => {
      console.log(`Feature idam is ${res ? 'enabled' : 'disabled'}`); // eslint-disable-line
      toggleStore.setToggle(toggle, res);
    });
  }

  getFeatureEnabled(feature, defaultValue, origin = 'other') {

    return get(feature, defaultValue || CONF.features[feature], origin, {
      node_env: CONF.e2e.defaultEnvironmentNodeEnv
    })
      .then(() => {
        return features[feature];
      });

  }

}

module.exports = FeatureToggleHelper;
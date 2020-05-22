'use strict';

const logger = require('app/services/logger').logger(__filename);
const LaunchDarkly = require('app/core/components/launch-darkly');
const CONF = require('config');

class FeatureToggle {
  constructor() {
    this.launchDarkly = new LaunchDarkly().getInstance();
  }

  callCheckToggle(req, res, next, launchDarkly, featureToggleKey, callbackFn, redirectPage) {
    return this.checkToggle({
      req,
      res,
      next,
      launchDarkly,
      featureToggleKey,
      callbackFn,
      redirectPage
    });
  }

  checkToggle(params) {
    const featureToggleKey = CONF.featureToggles[params.featureToggleKey];
    const ldUser = CONF.featureToggles.launchDarklyUser;

    let ldDefaultValue = false;
    if (params.launchDarkly.ftValue && params.launchDarkly.ftValue[params.featureToggleKey]) {
      ldDefaultValue = params.launchDarkly.ftValue[params.featureToggleKey];
    }

    try {
      this.launchDarkly.variation(featureToggleKey, ldUser, ldDefaultValue, (error, showFeature) => {
        if (error) {
          params.next();
        } else {
          logger.infoWithReq(params.req, 'check_feature_toggle', `Checking feature toggle: ${params.featureToggleKey}, isEnabled:`, showFeature);
          params.callbackFn({
            req: params.req,
            res: params.res,
            next: params.next,
            redirectPage: params.redirectPage,
            isEnabled: showFeature,
            featureToggleKey: params.featureToggleKey
          });
        }
      });
    } catch (error) {
      params.next();
    }
  }

  toggleFeature(params) {
    if (!params.req.session.featureToggles) {
      params.req.session.featureToggles = {};
    }
    params.req.session.featureToggles[params.featureToggleKey] = params.isEnabled;
    params.next();
  }

  static appwideToggles(req, ctx, appwideToggles) {
    if (appwideToggles.length) {
      ctx.featureToggles = {};
      appwideToggles.forEach(toggleKey => {
        ctx.featureToggles[toggleKey] = FeatureToggle.isEnabled(req.session.featureToggles, toggleKey).toString();
      });
    }

    return ctx;
  }

  static isEnabled(featureToggles, key) {
    if (featureToggles && featureToggles[key]) {
      return true;
    }
    return false;
  }
}

module.exports = FeatureToggle;

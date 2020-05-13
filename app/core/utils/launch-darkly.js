'use strict';

const CONF = require('config');
const launchDarkly = require('launchdarkly-node-server-sdk');

class LaunchDarkly {
  constructor(options, ftValue = false) {
    this.client = launchDarkly.init(CONF.featureToggles.launchDarklyKey, options);
    this.ftValue = ftValue;
  }
}

class Singleton {
  constructor(options, ftValue = false) {
    if (!Singleton.instance) {
      Singleton.instance = new LaunchDarkly(options, ftValue);
    }
  }

  getInstance() {
    return Singleton.instance;
  }
}

module.exports = Singleton;

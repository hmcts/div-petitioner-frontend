'use strict';

const CONF = require('config');
const launchDarkly = require('launchdarkly-node-server-sdk');
const logger = require('app/services/logger').logger(__filename);

class LaunchDarkly {
  constructor() {
    this.ready = false;
    const options = CONF.featureToggles.enabled ? { diagnosticOptOut: true } : { offline: true };

    logger.infoWithReq(null, 'launchdarkly_key', 'LaunchDarkly Key: ', CONF.featureToggles.launchDarklyKey);

    this.client = launchDarkly.init(CONF.featureToggles.launchDarklyKey, options);
    this.client.once('ready', () => {
      this.ready = true;
    });
  }

  variation(...params) {
    if (this.ready) {
      return this.client.variation(...params);
    }

    return this.client.once('ready', () => {
      this.ready = true;
      return this.client.variation(...params);
    });
  }

  close() {
    this.client.close();
  }
}

class Singleton {
  constructor(options = {}, ftValue = {}) {
    if (!this.instance) {
      this.instance = new LaunchDarkly(options, ftValue);

      process.on('SIGINT', () => {
        return this.close();
      });
      process.on('exit', () => {
        return this.close();
      });
    }
  }

  getInstance() {
    return this.instance;
  }

  close() {
    if (this.instance) {
      this.instance.close();
      delete this.instance;
    }
  }
}

module.exports = Singleton;

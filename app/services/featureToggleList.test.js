const supertest = require('supertest');
const statusCode = require('http-status-codes');
const server = require('app');
const CONF = require('config');

const modulePath = 'app/services/featureToggleList';

describe(modulePath, () => {
  describe('displays the correct data based on the default config', () => {
    let s = {};

    beforeEach(() => {
      s = server.init();
    });

    afterEach(() => {
      s.http.close();
    });

    it('should return success', done => {
      //  note that the features (jurisdiction, newJurisdiction and idam) are hardcoded into the app.js

      const defaultToggles = {
        jurisdiction: {
          feature: 'jurisdiction',
          defaultState: CONF.features.jurisdiction,
          origin: 'default config'
        },
        newJurisdiction: {
          feature: 'newJurisdiction',
          defaultState: CONF.features.newJurisdiction,
          origin: 'default config'
        },
        idam: {
          feature: 'idam',
          defaultState: CONF.features.idam,
          origin: 'default config'
        },
        foreignMarriageCerts: {
          feature: 'foreignMarriageCerts',
          defaultState: CONF.features.foreignMarriageCerts,
          origin: 'default config'
        },
        onlineSubmission: {
          feature: 'onlineSubmission',
          defaultState: CONF.features.onlineSubmission,
          origin: 'default config'
        }
      };

      supertest(s.app).get('/status/feature-toggles')
        .expect('Content-Type', /json/)
        .expect(statusCode.OK)
        .expect(defaultToggles, done);
    });
  });

  describe('displays the correct data based on jurisdiction and idam being process variables', () => {
    let s = {};
    let jurisdiction = null;
    let idam = null;

    beforeEach(() => {
      jurisdiction = process.env.jurisdiction;
      idam = process.env.idam;
      process.env.jurisdiction = false;
      process.env.idam = false;
      s = server.init();
    });

    afterEach(() => {
      s.http.close();
      if (!jurisdiction) delete process.env.jurisdiction;
      if (!idam) delete process.env.idam;
    });

    it('should return success', done => {
      const featureToggles = {
        jurisdiction: {
          defaultState: process.env.jurisdiction,
          feature: 'jurisdiction',
          origin: 'process env'
        },
        newJurisdiction: {
          defaultState: CONF.features.newJurisdiction,
          feature: 'newJurisdiction',
          origin: 'default config'
        },
        idam: {
          defaultState: process.env.idam,
          feature: 'idam',
          origin: 'process env'
        },
        foreignMarriageCerts: {
          defaultState: CONF.features.foreignMarriageCerts,
          feature: 'foreignMarriageCerts',
          origin: 'default config'
        },
        onlineSubmission: {
          feature: 'onlineSubmission',
          defaultState: true,
          origin: 'default config'
        }
      };

      supertest(s.app).get('/status/feature-toggles')
        .expect('Content-Type', /json/)
        .expect(statusCode.OK)
        .expect(featureToggles, done);
    });
  });

  describe('displays the correct data based on idam not being set', () => {
    let s = {};
    let features = null;

    beforeEach(() => {
      features = Object.assign({}, CONF.features);
      delete CONF.features.idam;
      s = server.init();
    });

    afterEach(() => {
      CONF.features = features;
      s.http.close();
    });

    it('should return success', done => {
      const featureToggles = {
        jurisdiction: {
          feature: 'jurisdiction',
          defaultState: CONF.features.jurisdiction,
          origin: 'default config'
        },
        newJurisdiction: {
          feature: 'newJurisdiction',
          defaultState: CONF.features.newJurisdiction,
          origin: 'default config'
        },
        idam: {
          feature: 'idam',
          defaultState: false,
          origin: 'other'
        },
        foreignMarriageCerts: {
          feature: 'foreignMarriageCerts',
          defaultState: CONF.features.foreignMarriageCerts,
          origin: 'default config'
        },
        onlineSubmission: {
          defaultState: true,
          feature: 'onlineSubmission',
          origin: 'default config'
        }
      };

      supertest(s.app).get('/status/feature-toggles')
        .expect('Content-Type', /json/)
        .expect(statusCode.OK)
        .expect(featureToggles, done);
    });
  });
});

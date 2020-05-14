/* eslint-disable max-lines */
'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const FeatureToggle = require('app/core/utils/featureToggle');
const config = require('config');

const timeout = 1000;

describe('FeatureToggle', () => {
  describe('checkToggle()', () => {
    it('should call the callback function when the api returns successfully', done => {
      const LaunchDarkly = require('launchdarkly-node-server-sdk');

      const dataSource = LaunchDarkly.FileDataSource({ paths: ['test/data/launchdarkly/simple_flag_data.yaml'] });
      const ldConfig = {
        updateProcessor: dataSource,
        sendEvents: false
      };

      const ldClient = LaunchDarkly.init(config.featureToggles.launchDarklyKey, ldConfig);

      const params = {
        req: { session: { form: {} } },
        res: {},
        next: () => {
          return true;
        },
        redirectPage: '/dummy-page',
        launchDarkly: { client: ldClient },
        featureToggleKey: 'ft_welsh',
        callbackFn: sinon.spy()
      };
      const featureToggle = new FeatureToggle();

      featureToggle.checkToggle(params);
      featureToggle.checkToggle(params); // Checking a second call to LaunchDarkly doesn't hang

      setTimeout(() => {
        expect(params.callbackFn.calledTwice).to.equal(true);
        expect(params.callbackFn.calledWith({
          req: params.req,
          res: params.res,
          next: params.next,
          redirectPage: params.redirectPage,
          isEnabled: true,
          featureToggleKey: params.featureToggleKey
        })).to.equal(true);

        ldClient.close();

        done();
      }, timeout);
    });

    it('should call next() when the api returns an error', done => {
      const params = {
        req: { session: { form: {} } },
        res: {},
        next: sinon.spy(),
        redirectPage: '/dummy-page',
        launchDarkly: { client: false },
        featureToggleKey: 'ft_welsh',
        callbackFn: () => {
          return true;
        }
      };
      const featureToggle = new FeatureToggle();

      featureToggle.checkToggle(params);

      expect(params.next.calledOnce).to.equal(true);

      done();
    });
  });

  describe('toggleFeature()', () => {
    describe('should set the feature toggle', () => {
      it('when the session contains a featureToggles object and call next()', done => {
        const params = {
          req: { session: { featureToggles: {} } },
          featureToggleKey: 'ft_test_toggle',
          isEnabled: true,
          next: sinon.spy()
        };
        const featureToggle = new FeatureToggle();

        featureToggle.toggleFeature(params);

        expect(params.req.session.featureToggles).to.deep.equal({ ft_test_toggle: true });
        expect(params.next.calledOnce).to.equal(true);
        expect(params.next.calledWith()).to.equal(true);
        done();
      });

      it('when the session does not contain a featureToggles object and call next()', done => {
        const params = {
          req: { session: {} },
          featureToggleKey: 'ft_test_toggle',
          isEnabled: true,
          next: sinon.spy()
        };
        const featureToggle = new FeatureToggle();

        featureToggle.toggleFeature(params);

        expect(params.req.session.featureToggles).to.deep.equal({ ft_test_toggle: true });
        expect(params.next.calledOnce).to.equal(true);
        expect(params.next.calledWith()).to.equal(true);
        done();
      });
    });
  });

  describe('appwideToggles()', () => {
    it('should return ctx when no appwide toggles are present', done => {
      const appwideToggles = [];
      const req = { session: { featureToggles: {} } };
      let ctx = {};

      ctx = FeatureToggle.appwideToggles(req, ctx, appwideToggles);

      expect(ctx).to.deep.equal({});
      done();
    });

    it('should add all appwide toggles to ctx when present', done => {
      const appwideToggles = ['ft_test_toggle'];
      const req = { session: { featureToggles: { ft_test_toggle: false } } };
      let ctx = {};

      ctx = FeatureToggle.appwideToggles(req, ctx, appwideToggles);

      expect(ctx).to.deep.equal({ featureToggles: { ft_test_toggle: 'false' } });
      done();
    });
  });

  describe('isEnabled()', () => {
    describe('should return true', () => {
      it('if the feature toggle exists and is true', done => {
        const featureToggles = { ft_test_toggle: true };
        const key = 'ft_test_toggle';
        const isEnabled = FeatureToggle.isEnabled(featureToggles, key);
        expect(isEnabled).to.equal(true);
        done();
      });
    });

    describe('should return false', () => {
      it('if the feature toggle exists and is false', done => {
        const featureToggles = { test_toggle: false };
        const key = 'test_toggle';
        const isEnabled = FeatureToggle.isEnabled(featureToggles, key);
        expect(isEnabled).to.equal(false);
        done();
      });

      it('if the feature toggle does not exist', done => {
        const featureToggles = {};
        const key = 'ft_test_toggle';
        const isEnabled = FeatureToggle.isEnabled(featureToggles, key);
        expect(isEnabled).to.equal(false);
        done();
      });

      it('if there are no feature toggles', done => {
        const featureToggles = '';
        const key = 'ft_test_toggle';
        const isEnabled = FeatureToggle.isEnabled(featureToggles, key);
        expect(isEnabled).to.equal(false);
        done();
      });

      it('if the key is not specified', done => {
        const featureToggles = { ft_test_toggle: false };
        const key = '';
        const isEnabled = FeatureToggle.isEnabled(featureToggles, key);
        expect(isEnabled).to.equal(false);
        done();
      });
    });
  });
});

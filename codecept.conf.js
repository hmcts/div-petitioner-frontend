/* eslint-disable no-magic-numbers */
const waitForTimeout = parseInt(process.env.E2E_WAIT_FOR_TIMEOUT_VALUE) || 10000;
const waitForAction = parseInt(process.env.E2E_WAIT_FOR_ACTION_VALUE) || 1000;

console.log('waitForAction value set to', waitForAction); // eslint-disable-line no-console

exports.config = {
  tests: './test/end-to-end/paths/**/*.js',
  timeout: 1000,
  helpers: {
    Nightmare: {
      url: process.env.TEST_URL || process.env.E2E_FRONTEND_URL || 'https://localhost:8080',
      waitForTimeout,
      typeInterval: 20,
      waitForAction,
      show: false,
      switches: {
        'ignore-certificate-errors': true,
        'proxy-server': process.env.E2E_PROXY_SERVER || ''
      }
    },
    FeatureToggleHelper: { require: './test/end-to-end/helpers/featureToggleHelper.js' },
    ElementExist: { require: './test/end-to-end/helpers/ElementExist.js' },
    NightmareExtras: {
      require: './test/end-to-end/helpers/NightmareExtras.js',
      waitForTimeout
    },
    IdamHelper: { require: './test/end-to-end/helpers/idamHelper.js' }
  },
  include: { I: './test/end-to-end/pages/steps.js' },
  name: 'frontend Tests'
};
/* eslint-disable no-magic-numbers */
const waitForTimeout = parseInt(process.env.E2E_WAIT_FOR_TIMEOUT_VALUE) || 10000;
const waitForAction = parseInt(process.env.E2E_WAIT_FOR_ACTION_VALUE) || 1000;

console.log('waitForTimeout value set to', waitForTimeout); // eslint-disable-line no-console
console.log('waitForAction value set to', waitForAction); // eslint-disable-line no-console

exports.config = {
  tests: './test/end-to-end/paths/**/*.js',
  output: './functional-output',
  timeout: waitForTimeout,
  helpers: {
    Nightmare: {
      url: process.env.E2E_FRONTEND_URL || 'https://localhost:8080',
      waitForTimeout,
      loadTimeout: waitForTimeout,
      typeInterval: 100,
      waitForAction,
      show: false,
      switches: {
        'ignore-certificate-errors': true,
        'proxy-server': process.env.E2E_PROXY_SERVER || '',
        'proxy-bypass-list': process.env.E2E_PROXY_BYPASS || ''
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
  mocha: {
    reporterOptions: {
      'codeceptjs-cli-reporter': {
        stdout: '-',
        options: { steps: true }
      },
      'mocha-junit-reporter': {
        stdout: '-',
        options: { mochaFile: './functional-output/result.xml' }
      },
      mochawesome: {
        stdout: './functional-output/console.log',
        options: {
          reportDir: process.env.E2E_OUTPUT_DIR || './functional-output',
          reportName: 'index',
          inlineAssets: true
        }
      }
    }
  },
  name: 'frontend Tests'
};

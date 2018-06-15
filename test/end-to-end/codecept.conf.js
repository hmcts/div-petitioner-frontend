/* eslint-disable no-magic-numbers */
const CONF = require('config');

const waitForTimeout = parseInt(process.env.E2E_WAIT_FOR_TIMEOUT_VALUE) || 10000;
const waitForAction = parseInt(process.env.E2E_WAIT_FOR_ACTION_VALUE) || 100;

console.log('waitForTimeout value set to', waitForTimeout); // eslint-disable-line no-console
console.log('waitForAction value set to', waitForAction); // eslint-disable-line no-console

exports.config = {
  tests: getTests(),
  output: process.cwd() + '/functional-output',
  helpers: {
    Puppeteer: {
      url: process.env.E2E_FRONTEND_URL || 'https://localhost:8080',
      waitForTimeout,
      waitForAction,
      show: false,
      restart: false,
      keepCookies: false,
      keepBrowserState: false,
      chrome: {
        ignoreHTTPSErrors: true,
        args: [
          '--no-sandbox',
          `--proxy-server=${process.env.E2E_PROXY_SERVER}`,
          `--proxy-bypass-list=${process.env.E2E_PROXY_BYPASS}`
        ]
      }
    },
    FeatureToggleHelper: { require: './helpers/featureToggleHelper.js' },
    ElementExist: { require: './helpers/ElementExist.js' },
    IdamHelper: { require: './helpers/idamHelper.js' },
    JSWait: { require: './helpers/JSWait.js' }
  },
  include: { I: './pages/steps.js' },
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
  multiple: {
    parallel: {
      chunks: 2,
      browsers: ['chrome']
    }
  },
  name: 'frontend Tests'
};

// Temporarily turn off functional tests in Preview until more stable (#DIV-2734).
// E2E tests must be run manually against Preview in the meantime.
function getTests() {
  console.log('### CONF.env =', CONF.env);  // eslint-disable-line no-console
  if (CONF.env !== 'preview') {
    return './paths/**/*.js';
  } else {
    return './smoke/*.js';
  }
}
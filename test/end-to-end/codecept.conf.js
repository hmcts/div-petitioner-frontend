/* eslint-disable no-magic-numbers */
const CONF = require('config');

const waitForTimeout = parseInt(CONF.e2e.waitForTimeoutValue);
const waitForAction = parseInt(CONF.e2e.waitForActionValue);

exports.config = {
  tests: getTests(),
  output: process.cwd() + '/functional-output',
  helpers: {
    Puppeteer: {
      url: CONF.e2e.frontendUrl,
      waitForTimeout,
      waitForAction,
      show: true,
      chrome: {
        ignoreHTTPSErrors: true,
        args: [
          '--disable-gpu', '--no-sandbox', '--allow-running-insecure-content', '--ignore-certificate-errors',
          `--proxy-server=${process.env.E2E_PROXY_SERVER || ''}`,
          `--proxy-bypass-list=${process.env.E2E_PROXY_BYPASS || ''}`
        ]
      }
    },
    ElementExist: { require: './helpers/ElementExist.js' },
    IdamHelper: { require: './helpers/idamHelper.js' },
    JSWait: { require: './helpers/JSWait.js' },
    SessionHelper: { require: './helpers/SessionHelper.js' }
  },
  include: { I: './pages/steps.js' },
  plugins: {
    retryFailedStep: {
      enabled: true,
      retries: 1
    }
  },
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
          reportDir: CONF.e2e.outputDirectory,
          reportName: 'index',
          inlineAssets: true
        }
      }
    }
  },
  multiple: {
    parallel: {
      chunks: configureChunks(),
      browsers: ['chrome']
    }
  },
  name: 'Petitioner Frontend Tests'
};

// Reduce chunks on Preview env
function configureChunks() {
  if (CONF.e2e.runBasicTests === 'true') {
    return 1;
  } else {
    return 1;
  }
}

// Temporarily turn off functional tests in Preview until more stable (#DIV-2734).
// E2E tests must be run manually against Preview in the meantime.
function getTests() {
  if (CONF.e2e.runBasicTests === 'true') {
    return './paths/**/basicDivorce.js';
  } else {
    return './paths/**/*.js';
  }
}

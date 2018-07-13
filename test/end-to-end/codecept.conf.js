/* eslint-disable no-magic-numbers */
const CONF = require('config');

const waitForTimeout = parseInt(CONF.e2e.waitForTimeoutValue);
const waitForAction = parseInt(CONF.e2e.waitForActionValue);

console.log('waitForTimeout value set to', waitForTimeout); // eslint-disable-line no-console
console.log('waitForAction value set to', waitForAction); // eslint-disable-line no-console

exports.config = {
  tests: getTests(),
  output: process.cwd() + '/functional-output',
  helpers: {
    Puppeteer: {
      url: CONF.e2e.frontendUrl,
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
  name: 'frontend Tests'
};

// Reduce chunks on Preview env
function configureChunks() {
  console.log('### CONF.preview_env =', CONF.preview_env);  // eslint-disable-line no-console
  if (CONF.preview_env === 'true') {
    return 2;
  } else {
    return 5;
  }
}

// Temporarily turn off functional tests in Preview until more stable (#DIV-2734).
// E2E tests must be run manually against Preview in the meantime.
function getTests() {
  console.log('### CONF.preview_env =', CONF.preview_env);  // eslint-disable-line no-console
  if (CONF.preview_env === 'true') {
    return './paths/**/basicDivorce.js';
  } else {
    return './paths/**/*.js';
  }
}
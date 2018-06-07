const waitForTimeout = parseInt(process.env.E2E_WAIT_FOR_TIMEOUT_VALUE) || 10000;
const waitForAction = parseInt(process.env.E2E_WAIT_FOR_ACTION_VALUE) || 250;
const CONF = require('config');

exports.config = {
  tests: './smoke/*.js',
  output: process.cwd() + '/smoke-output',
  helpers: {
    Puppeteer: {
      url: CONF.testUrl || CONF.e2e.frontendUrl,
      waitForTimeout,
      waitForAction,
      show: false,
      chrome: {
        ignoreHTTPSErrors: true,
        args: [
          '--no-sandbox',
          `--proxy-server=${CONF.e2e.proxyServer}`,
          `--proxy-bypass-list=${CONF.e2e.proxyBypassList}`
        ]
      }
    },
    JSWait: { require: './helpers/JSWait.js' }
  },
  mocha: {
    reporterOptions: {
      'codeceptjs-cli-reporter': {
        stdout: '-',
        options: { steps: true }
      },
      'mocha-junit-reporter': {
        stdout: '-',
        options: { mochaFile: './smoke-output/result.xml' }
      }
    }
  },
  name: 'frontend Smoke Tests'
};
/* eslint-disable no-console */

const supportedBrowsers = require('../crossbrowser/supportedBrowsers.js');
const CONF = require('config');

const waitForTimeout = parseInt(CONF.saucelabs.waitForTimeoutValue);
const smartWait = parseInt(CONF.saucelabs.smartWait);
const browser = process.env.SAUCE_BROWSER || CONF.saucelabs.browser;
const tunnelName = process.env.SAUCE_TUNNEL_IDENTIFIER || CONF.saucelabs.tunnelId;

const getBrowserConfig = () => {
  const browserConfig = [];
  for (const candidateBrowser in supportedBrowsers) {
    if (candidateBrowser) {
      const desiredCapability = supportedBrowsers[candidateBrowser];
      desiredCapability.tunnelIdentifier = tunnelName;
      desiredCapability.tags = ['divorce'];
      browserConfig.push({
        browser: desiredCapability.browserName,
        desiredCapabilities: desiredCapability
      });
    } else {
      console.error('ERROR: supportedBrowsers.js is empty or incorrectly defined');
    }
  }
  return browserConfig;
};

const setupConfig = {
  tests: './paths/**/basicDivorce.js',
  output: process.cwd() + '/functional-output',
  helpers: {
    WebDriverIO: {
      url: process.env.E2E_FRONTEND_URL || CONF.e2e.frontendUrl,
      browser,
      waitForTimeout,
      smartWait,
      cssSelectorsEnabled: 'true',
      host: 'ondemand.saucelabs.com',
      port: 80,
      user: process.env.SAUCE_USERNAME || CONF.saucelabs.username,
      key: process.env.SAUCE_ACCESS_KEY || CONF.saucelabs.key,
      desiredCapabilities: {}
    },
    SauceLabsReportingHelper: { require: './helpers/SauceLabsReportingHelper.js' },
    JSWait: { require: './helpers/JSWait.js' },
    ElementExist: { require: './helpers/ElementExist.js' },
    IdamHelper: { require: './helpers/idamHelper.js' }
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
        options: { mochaFile: `${CONF.e2e.outputDir}/result.xml` }
      },
      mochawesome: {
        stdout: `${CONF.e2e.outputDir}/console.log`,
        options: {
          reportDir: CONF.e2e.outputDir,
          reportName: 'index',
          inlineAssets: true
        }
      }
    }
  },
  multiple: {
    saucelabs: {
      browsers: getBrowserConfig()
    }
  },
  name: 'Frontend Tests'
};

exports.config = setupConfig;
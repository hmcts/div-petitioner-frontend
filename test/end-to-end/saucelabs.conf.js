/* eslint-disable no-console */

const supportedBrowsers = require('../crossbrowser/supportedBrowsers.js');
const CONF = require('config');

const waitForTimeout = parseInt(CONF.saucelabs.waitForTimeoutValue);
const smartWait = parseInt(CONF.saucelabs.smartWait);
const browser = process.env.SAUCE_BROWSER || CONF.saucelabs.browser;
const tunnelName = process.env.SAUCE_TUNNEL_IDENTIFIER || CONF.saucelabs.tunnelId;
const getBrowserConfig = (browserGroup) => {
  const browserConfig = [];
  for (const candidateBrowser in supportedBrowsers[browserGroup]) {
    if (candidateBrowser) {
      const desiredCapability = supportedBrowsers[browserGroup][candidateBrowser];
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
      host: 'ondemand.eu-central-1.saucelabs.com',
      port: 80,
      region: 'eu',
      user: process.env.SAUCE_USERNAME || CONF.saucelabs.username,
      key: process.env.SAUCE_ACCESS_KEY || CONF.saucelabs.key,
      desiredCapabilities: {}
    },
    SauceLabsReportingHelper: { require: './helpers/SauceLabsReportingHelper.js' },
    JSWait: { require: './helpers/JSWait.js' },
    ElementExist: { require: './helpers/ElementExist.js' },
    IdamHelper: { require: './helpers/idamHelper.js' },
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
        options: { mochaFile: `${CONF.e2e.outputDir}/result.xml` }
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
    microsoftIE11: {
      browsers: getBrowserConfig('microsoftIE11')
    },
    microsoftEdge: {
      browsers: getBrowserConfig('microsoftEdge')
    },
    chrome: {
      browsers: getBrowserConfig('chrome')
    },
    firefox: {
      browsers: getBrowserConfig('firefox')
    }
  },
  name: 'PFE Frontend Tests'
};

exports.config = setupConfig;

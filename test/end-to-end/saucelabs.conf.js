/* eslint-disable no-console */

const supportedBrowsers = require('../crossbrowser/supportedBrowsers.js');
const CONF = require('config');
const merge = require('test/end-to-end/helpers/GeneralHelpers.js').merge;

const waitForTimeout = parseInt(CONF.saucelabs.waitForTimeout);
const smartWait = parseInt(CONF.saucelabs.smartWait);
const browser = process.env.SAUCE_BROWSER || CONF.saucelabs.browser;
const defaultSauceOptions = {
  username: process.env.SAUCE_USERNAME || CONF.saucelabs.username,
  accessKey: process.env.SAUCE_ACCESS_KEY || CONF.saucelabs.key,
  acceptSslCerts: true,
  tags: ['divorce']
};

const getBrowserConfig = (browserGroup) => {
  const browserConfig = [];
  for (const candidateBrowser in supportedBrowsers[browserGroup]) {
    if (candidateBrowser) {
      const candidateCapabilities = supportedBrowsers[browserGroup][candidateBrowser];
      candidateCapabilities['sauce:options'] = merge(defaultSauceOptions, candidateCapabilities['sauce:options']);
      browserConfig.push({
        browser: candidateCapabilities.browserName,
        capabilities: candidateCapabilities
      });
    } else {
      console.error('ERROR: supportedBrowsers.js is empty or incorrectly defined');
    }
  }
  return browserConfig;
};

const setupConfig = {
  tests: './paths/**/*.js',
  output: process.cwd() + '/functional-output',
  helpers: {
    WebDriver: {
      url: process.env.E2E_FRONTEND_URL || CONF.e2e.frontendUrl,
      browser,
      waitForTimeout,
      smartWait,
      cssSelectorsEnabled: 'true',
      host: 'ondemand.eu-central-1.saucelabs.com',
      port: 80,
      region: 'eu',
      capabilities: {}
    },
    SauceLabsBrowserHelper: { require: './helpers/SauceLabsBrowserHelper.js' },
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
    },
    safari: {
      browsers: getBrowserConfig('safari')
    }
  },
  name: 'PFE Frontend Tests'
};

exports.config = setupConfig;

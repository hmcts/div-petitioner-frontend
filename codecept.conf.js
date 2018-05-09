/* eslint-disable no-magic-numbers */
const CONF = require('config');

const waitForTimeout = parseInt(CONF.e2e.waitForTimeoutValue);
const waitForAction = parseInt(CONF.e2e.waitForActionValue);

console.log('waitForTimeout value set to', waitForTimeout); // eslint-disable-line no-console
console.log('waitForAction value set to', waitForAction); // eslint-disable-line no-console

exports.config = {
  tests: './test/end-to-end/paths/**/basicDivorce.js',
  output: './functional-output',
  timeout: waitForTimeout,
  helpers: {
    Nightmare: {
      url: CONF.e2e.frontendUrl,
      waitForTimeout,
      loadTimeout: waitForTimeout,
      typeInterval: 100,
      waitForAction,
      show: false,
      switches: {
        'ignore-certificate-errors': true,
        'proxy-server': CONF.e2e.proxyServer,
        'proxy-bypass-list': CONF.e2e.proxyBypassList
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
          reportDir: CONF.e2e.outputDirectory,
          reportName: 'index',
          inlineAssets: true
        }
      }
    }
  },
  name: 'frontend Tests'
};

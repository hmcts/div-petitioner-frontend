const glob = require('glob');
const fsPath = require('path');
const fs = require('fs');
const waitForTimeout = parseInt(process.env.E2E_WAIT_FOR_TIMEOUT_VALUE) || 10000;
const waitForAction = parseInt(process.env.E2E_WAIT_FOR_ACTION_VALUE) || 1000;
const testsToRun = './paths/**/*.js';
const outputDir = './output';

console.log('waitForAction value set to', waitForAction); // eslint-disable-line no-console

exports.config = {
  'tests': testsToRun,
  'output': outputDir,
  'timeout': 1000,
  'multiple': getFeatureNames(),
  'helpers': {
    'Nightmare': {
      'url': process.env.E2E_FRONTEND_URL || 'https://localhost:8080',
      'waitForTimeout': waitForTimeout,
      'typeInterval': 20,
      'waitForAction': waitForAction,
      'show': false,
      'switches': {
        'ignore-certificate-errors': true
      }
    },
    'FeatureToggleHelper': {
      'require': './helpers/featureToggleHelper.js'
    },
    'ElementExist': {
      'require': './helpers/ElementExist.js'
    },
    'NightmareExtras': {
      'require': './helpers/NightmareExtras.js',
      'waitForTimeout': waitForTimeout
    },
    'IdamHelper': {
      'require': './helpers/idamHelper.js'
    }
  },
  'include': {
    'I': './pages/steps.js'
  },
  'mocha': {
    'reporterOptions': {
      'codeceptjs-cli-reporter': {
        'stdout': '-',
        'options': {
          'steps': true
        }
      },
      'mochawesome': {
        'stdout': './output/console.log',
        'options': {
          'reportDir': process.env.E2E_OUTPUT_DIR || './output',
          'reportName': 'index',
          'inlineAssets': true
        }
      }
    }
  },
  'name': 'frontEnd Tests'
};

function getFeatureNames() {

  let testFiles = {};

  glob.sync(fsPath.resolve(__dirname, testsToRun)).forEach((file) => {

    // Collect features to grep for and test via 'codeceptjs run-multiple'
    let featureName;
    fs.readFileSync(file).toString().split('\n').forEach(function (line) {
      if (line.indexOf('Feature(') > -1) {
        featureName = (line.split('\'')[1]).replace('\\', '');
      }
    });

    // Build test runners that only run single features
    testFiles[featureName] = {
      'grep': '(?=.*' + featureName + ')',
      'browsers': ['chrome']
    };
  });

  return testFiles;
}

function escapeRegExp(text) { // eslint-disable-line no-unused-vars
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

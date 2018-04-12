const waitForTimeout = parseInt(process.env.E2E_WAIT_FOR_TIMEOUT_VALUE) || 10000;
const waitForAction = parseInt(process.env.E2E_WAIT_FOR_ACTION_VALUE) || 1000;

console.log('waitForAction value set to', waitForAction); // eslint-disable-line no-console

exports.config = {
  'tests': './paths/**/*.js',
  'output': '../../functional-output',
  'timeout': 1000,
  'helpers': {
    'Nightmare': {
      'url': process.env.TEST_URL || process.env.E2E_FRONTEND_URL || 'https://localhost:8080',
      'waitForTimeout': waitForTimeout,
      'typeInterval': 20,
      'waitForAction': waitForAction,
      'show': false,
      'switches': {
        'ignore-certificate-errors': true,
        'proxy-server': process.env.E2E_PROXY_SERVER || ''
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
        'stdout': '../../functional-output/console.log',
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
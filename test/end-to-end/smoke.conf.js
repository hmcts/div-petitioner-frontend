const waitForTimeout = parseInt(process.env.E2E_WAIT_FOR_TIMEOUT_VALUE) || 10000;
const waitForAction = parseInt(process.env.E2E_WAIT_FOR_ACTION_VALUE) || 1000;

console.log('waitForAction value set to', waitForAction); // eslint-disable-line no-console

exports.config = {
  'tests': './paths/smoke/*.js',
  'output': '../../smoke-output',
  'timeout': 1000,
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
    'NightmareExtras': {
      'require': './helpers/NightmareExtras.js',
      'waitForTimeout': waitForTimeout
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
        'stdout': '../../smoke-output/console.log',
        'options': {
          'reportDir': process.env.SMOKE_OUTPUT_DIR || '../../smoke-output',
          'reportName': 'index',
          'inlineAssets': true
        }
      }
    }
  },
  'name': 'frontEnd Smoke Tests'
};
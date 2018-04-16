exports.config = {
  'tests': './paths/smoke/*.js',
  'output': '../../smoke-output',
  'timeout': 5000,
  'helpers': {
    'WebDriverIO' : {
      'url': process.env.TEST_URL || process.env.E2E_FRONTEND_URL || 'https://localhost:8080',
      'browser': 'chrome',
      'cssSelectorsEnabled': 'true',
      'waitforTimeout': 20000,
      'smartWait': 5000,
      'timeouts': {
        'script': 20000,
        'page load': 20000,
        'implicit': 5000
      },
      'desiredCapabilities': {
        'chromeOptions': {
          'args': [ '--headless', '--disable-gpu', '--window-size=800,600', '--ignore-certificate-errors' ]
        }
      }
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
  'name': 'frontend Smoke Tests'
};
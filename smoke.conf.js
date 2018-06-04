const CONF = require('config');

exports.config = {
  tests: './test/end-to-end/smoke/*.js',
  output: './smoke-output',
  timeout: 5000,
  helpers: {
    Nightmare: {
      url: CONF.testUrl || CONF.e2e.frontendUrl,
      show: false,
      switches: {
        'ignore-certificate-errors': true,
        'proxy-server': CONF.e2e.proxyServer,
        'proxy-bypass-list': CONF.e2e.proxyBypassList
      }
    }
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
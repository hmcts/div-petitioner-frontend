exports.config = {
  tests: './smoke/*.js',
  output: '../../smoke-output',
  timeout: 5000,
  helpers: {
    Nightmare: {
      url: process.env.TEST_URL || process.env.E2E_FRONTEND_URL || 'https://localhost:8080',
      show: false,
      switches: {
        'ignore-certificate-errors': true,
        'proxy-server': process.env.E2E_PROXY_SERVER || '',
        'proxy-bypass-list': process.env.E2E_PROXY_BYPASS || ''
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
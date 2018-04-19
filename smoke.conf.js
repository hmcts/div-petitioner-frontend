exports.config = {
  tests: './test/end-to-end/smoke/*.js',
  output: './smoke-output',
  timeout: 1000,
  helpers: {
    Nightmare: {
      url: process.env.TEST_URL || process.env.E2E_FRONTEND_URL || 'https://localhost:8080',
      show: false,
      switches: {
        'ignore-certificate-errors': true,
        'proxy-server': process.env.E2E_PROXY_SERVER || ''
      }
    }
  },
  name: 'frontend Smoke Tests'
};
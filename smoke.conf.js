exports.config = {
  tests: './test/end-to-end/smoke/*.js',
  output: './smoke-output',
  timeout: 5000,
  helpers: {
    Puppeteer: {
      url: process.env.TEST_URL || process.env.E2E_FRONTEND_URL || 'https://localhost:8080',
      show: false,
      chrome: {
        ignoreHTTPSErrors: true,
        args: ['--no-sandbox']
      }
    }
  },
  name: 'frontend Smoke Tests'
};
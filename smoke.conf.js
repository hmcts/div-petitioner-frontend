exports.config = {
  tests: './test/end-to-end/smoke/*.js',
  output: './smoke-output',
  timeout: 5000,
  helpers: {
    WebDriverIO: {
      url: process.env.TEST_URL || process.env.E2E_FRONTEND_URL || 'https://localhost:8080',
      browser: 'chrome',
      smartWait: 5000
    }
  },
  name: 'frontend Smoke Tests'
};
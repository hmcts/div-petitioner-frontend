const strykerConfiguration = config => {
  config.set({
    testRunner: 'mocha',
    mutator: 'javascript',
    transpilers: [],
    reporter: ['clear-text', 'progress', 'html'],
    testFramework: 'mocha',
    coverageAnalysis: 'perTest',
    mutate: ['app/services/**/*.js', '!app/services/**/*.test.js'],
    files: ['**/*'],
    maxConcurrentTestRunners: 1,
    symlinkNodeModules: false,
    htmlReporter: { baseDir: 'stryker-reports/html' },
    mochaOptions: {
      files: [ 'app/services/**/*.test.js' ],
      timeout: 8000
    },
    logLevel: 'debug',
    plugins: ['stryker-mocha-runner', 'stryker-mocha-framework', 'stryker-javascript-mutator', 'stryker-html-reporter']
  });
};

module.exports = strykerConfiguration;
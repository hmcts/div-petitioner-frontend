const strykerConfiguration = config => {
  config.set({
    testRunner: 'mocha',
    mutator: 'javascript',
    transpilers: [],
    reporter:
      [
        'clear-text',
        'progress',
        'html'
      ],
    testFramework: 'mocha',
    coverageAnalysis: 'perTest',
    mutate:
      [
        'app/assets/**/*.js',
        'app/components/**/*.js',
        'app/content/**/*.js',
        'app/core/**/*.js',
        '!app/assets/**/*.test.js',
        '!app/components/**/*.test.js',
        '!app/content/**/*.test.js',
        '!app/core/**/*.test.js'
      ],
    files: [ '**/*' ],
    maxConcurrentTestRunners: 2,
    symlinkNodeModules: false,
    htmlReporter: { baseDir: 'stryker-reports/html' },
    mochaOptions: {
      files:
        [
          'app/assets/**/*.test.js',
          'app/components/**/*.test.js',
          'app/content/**/*.test.js',
          'app/core/**/*.test.js'
        ],
      timeout: 8000
    },
    logLevel: 'debug',
    plugins:
      [
        'stryker-mocha-runner',
        'stryker-mocha-framework',
        'stryker-javascript-mutator',
        'stryker-html-reporter'
      ]
  });
};

module.exports = strykerConfiguration;

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
        'app/steps/grounds-for-divorce/**/*.js',
        '!app/steps/grounds-for-divorce/**/*.test.js'
      ],
    files: [ '**/*' ],
    maxConcurrentTestRunners: 3,
    symlinkNodeModules: false,
    htmlReporter: { baseDir: 'functional-output/mutation-steps-e' },
    mochaOptions: {
      files:
        [
          'app/steps/grounds-for-divorce/**/*.test.js'
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

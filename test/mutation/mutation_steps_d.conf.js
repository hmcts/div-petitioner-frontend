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
        'app/steps/financial/**/*.js',
        'app/steps/help/**/*.js',
        'app/steps/index/**/*.js',
        'app/steps/legal/**/*.js',
        '!app/steps/financial/**/*.test.js',
        '!app/steps/help/**/*.test.js',
        '!app/steps/index/**/*.test.js',
        '!app/steps/legal/**/*.test.js'
      ],
    files: [ '**/*' ],
    maxConcurrentTestRunners: 2,
    symlinkNodeModules: false,
    htmlReporter: { baseDir: 'functional-output/mutation-steps-d' },
    mochaOptions: {
      files:
        [
          'app/steps/financial/**/*.test.js',
          'app/steps/help/**/*.test.js',
          'app/steps/index/**/*.test.js',
          'app/steps/legal/**/*.test.js'
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

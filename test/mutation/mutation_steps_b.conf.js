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
        'app/steps/error-400/**/*.js',
        'app/steps/error-404/**/*.js',
        'app/steps/error-500/**/*.js',
        'app/steps/error-generic/**/*.js',
        'app/steps/error-submitted/**/*.js',
        '!app/steps/error-400/**/*.test.js',
        '!app/steps/error-404/**/*.test.js',
        '!app/steps/error-500/**/*.test.js',
        '!app/steps/error-generic/**/*.test.js',
        '!app/steps/error-submitted/**/*.test.js'
      ],
    files: [ '**/*' ],
    maxConcurrentTestRunners: 2,
    symlinkNodeModules: false,
    htmlReporter: { baseDir: 'functional-output/mutation-steps-b' },
    mochaOptions: {
      files:
        [
          'app/steps/error-400/**/*.test.js',
          'app/steps/error-404/**/*.test.js',
          'app/steps/error-500/**/*.test.js',
          'app/steps/error-generic/**/*.test.js',
          'app/steps/error-submitted/**/*.test.js'
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

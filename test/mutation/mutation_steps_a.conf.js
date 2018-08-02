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
        'app/steps/authenticated/**/*.js',
        'app/steps/bye/**/*.js',
        'app/steps/check-your-answers/**/*.js',
        'app/steps/done-and-submitted/**/*.js',
        '!app/steps/authenticated/**/*.test.js',
        '!app/steps/bye/**/*.test.js',
        '!app/steps/check-your-answers/**/*.test.js',
        '!app/steps/done-and-submitted/**/*.test.js'
      ],
    files: [ '**/*' ],
    maxConcurrentTestRunners: 2,
    symlinkNodeModules: false,
    htmlReporter: { baseDir: 'functional-output/mutation-steps-a' },
    mochaOptions: {
      files:
        [
          'app/steps/authenticated/**/*.test.js',
          'app/steps/bye/**/*.test.js',
          'app/steps/check-your-answers/**/*.test.js',
          'app/steps/done-and-submitted/**/*.test.js'
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

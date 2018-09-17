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
        'app/steps/legal/**/*.js',
        'app/steps/living-arrangements/**/*.js',
        'app/steps/prayer/**/*.js',
        'app/steps/privacy-policy/**/*.js',
        '!app/steps/legal/**/*.test.js',
        '!app/steps/living-arrangements/**/*.test.js',
        '!app/steps/prayer/**/*.test.js',
        '!app/steps/privacy-policy/**/*.test.js'
      ],
    files: [ '**/*' ],
    maxConcurrentTestRunners: 2,
    symlinkNodeModules: false,
    htmlReporter: { baseDir: 'functional-output/mutation-steps-g' },
    mochaOptions: {
      files:
        [
          'app/steps/legal/**/*.test.js',
          'app/steps/living-arrangements/**/*.test.js',
          'app/steps/prayer/**/*.test.js',
          'app/steps/privacy-policy/**/*.test.js'
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

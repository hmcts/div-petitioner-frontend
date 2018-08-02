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
        'app/steps/respondant/**/*.js',
        'app/steps/save-resume/**/*.js',
        'app/steps/screening-questions/**/*.js',
        'app/steps/sitemap/**/*.js',
        'app/steps/start/**/*.js',
        'app/steps/submit/**/*.js',
        'app/steps/terms-and-conditions/**/*.js',
        'app/steps/timeout/**/*.js',
        '!app/steps/respondant/**/*.test.js',
        '!app/steps/save-resume/**/*.test.js',
        '!app/steps/screening-questions/**/*.test.js',
        '!app/steps/sitemap/**/*.test.js',
        '!app/steps/start/**/*.test.js',
        '!app/steps/submit/**/*.test.js',
        '!app/steps/terms-and-conditions/**/*.test.js',
        '!app/steps/timeout/**/*.test.js'
      ],
    files: [ '**/*' ],
    maxConcurrentTestRunners: 2,
    symlinkNodeModules: false,
    htmlReporter: { baseDir: 'functional-output/mutation-steps-k' },
    mochaOptions: {
      files:
        [
          'app/steps/respondant/**/*.test.js',
          'app/steps/save-resume/**/*.test.js',
          'app/steps/screening-questions/**/*.test.js',
          'app/steps/sitemap/**/*.test.js',
          'app/steps/start/**/*.test.js',
          'app/steps/submit/**/*.test.js',
          'app/steps/terms-and-conditions/**/*.test.js',
          'app/steps/timeout/**/*.test.js'
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

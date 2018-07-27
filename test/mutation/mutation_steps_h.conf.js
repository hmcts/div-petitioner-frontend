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
        'app/steps/marriage/about-your-marriage-certificate/**/*.js',
        'app/steps/marriage/certificate-names/**/*.js',
        'app/steps/marriage/date/**/*.js',
        'app/steps/marriage/foreign-certificate/**/*.js',
        '!app/steps/marriage/about-your-marriage-certificate/**/*.test.js',
        '!app/steps/marriage/certificate-names/**/*.test.js',
        '!app/steps/marriage/date/**/*.test.js',
        '!app/steps/marriage/foreign-certificate/**/*.test.js'
      ],
    files: [ '**/*' ],
    maxConcurrentTestRunners: 2,
    symlinkNodeModules: false,
    htmlReporter: { baseDir: 'functional-output/mutation-steps-h' },
    mochaOptions: {
      files:
        [
          'app/steps/marriage/about-your-marriage-certificate/**/*.test.js',
          'app/steps/marriage/certificate-names/**/*.test.js',
          'app/steps/marriage/date/**/*.test.js',
          'app/steps/marriage/foreign-certificate/**/*.test.js'
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

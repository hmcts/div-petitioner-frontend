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
        'app/steps/marriage/husband-or-wife/**/*.js',
        'app/steps/marriage/in-the-uk/**/*.js',
        'app/steps/marriage/names/**/*.js',
        'app/steps/marriage/upload/**/*.js',
        '!app/steps/marriage/husband-or-wife/**/*.test.js',
        '!app/steps/marriage/in-the-uk/**/*.test.js',
        '!app/steps/marriage/names/**/*.test.js',
        '!app/steps/marriage/upload/**/*.test.js'
      ],
    files: [ '**/*' ],
    maxConcurrentTestRunners: 2,
    symlinkNodeModules: false,
    htmlReporter: { baseDir: 'functional-output/mutation-steps-i' },
    mochaOptions: {
      files:
        [
          'app/steps/marriage/husband-or-wife/**/*.test.js',
          'app/steps/marriage/in-the-uk/**/*.test.js',
          'app/steps/marriage/names/**/*.test.js',
          'app/steps/marriage/upload/**/*.test.js'
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

/* eslint-disable no-magic-numbers */
const CONF = require('config');

const waitForTimeout = parseInt(CONF.e2e.waitForTimeoutValue);
const waitForAction = parseInt(CONF.e2e.waitForActionValue);

console.log('waitForTimeout value set to', waitForTimeout); // eslint-disable-line no-console
console.log('waitForAction value set to', waitForAction); // eslint-disable-line no-console

exports.config = {
  tests: './paths/**/*.js',
  output: process.cwd() + '/functional-output',
  helpers: {
    Puppeteer: {
      url: CONF.e2e.frontendUrl,
      waitForTimeout,
      waitForAction,
      show: false,
      chrome: {
        ignoreHTTPSErrors: true,
        args: [
          '--no-sandbox',
          `--proxy-server=${process.env.E2E_PROXY_SERVER}`,
          `--proxy-bypass-list=${process.env.E2E_PROXY_BYPASS}`
        ]
      }
    },
    FeatureToggleHelper: { require: './helpers/featureToggleHelper.js' },
    ElementExist: { require: './helpers/ElementExist.js' },
    IdamHelper: { require: './helpers/idamHelper.js' },
    JSWait: { require: './helpers/JSWait.js' }
  },
  include: { I: './pages/steps.js' },
  mocha: {
    reporterOptions: {
      'codeceptjs-cli-reporter': {
        stdout: '-',
        options: { steps: true }
      },
      'mocha-junit-reporter': {
        stdout: '-',
        options: { mochaFile: './functional-output/result.xml' }
      },
      mochawesome: {
        stdout: './functional-output/console.log',
        options: {
          reportDir: CONF.e2e.outputDirectory,
          reportName: 'index',
          inlineAssets: true
        }
      }
    }
  },
  multiple: {
    parallel: {
      chunks: (files) => {
        let configuredChunks = constructChunksWithFullFilePaths([
          [ 'jurisdictionConnections.js', 'cookieBanner.js', 'logout.js' ],
          [ 'payment.js', 'errorPaths.js', 'postcode.js' ],
          [ 'reasonsForDivorce.js', 'invalidCsrf.js', 'reportAProblemPath.js' ],
          [ 'livingTogether.js', 'save-resume.js', 'aboutYourMarriageCertificate.js', 'staticPages.js' ],
          [ 'foreignMarriageCertificates.js', 'basicDivorce.js', 'startSession.js', 'uploadMarriageCertificate.js' ]
        ], files[0]);

        const leftoverTestFiles = getUndefinedTestFiles(configuredChunks, files[0]);
        if (leftoverTestFiles.length > 0) {
          configuredChunks.push([ leftoverTestFiles ]); // add any undefined test files
        }
        return configuredChunks;
      },
      browsers: ['chrome']
    }
  },
  name: 'frontend Tests'
};

function getUndefinedTestFiles(chunks, allFiles) {
  chunks.forEach((chunk)=> {
    chunk.forEach((testFile) => {
      const index = allFiles.indexOf(testFile);
      if(index > -1) { allFiles.splice(index, 1); }
    });
  });

  console.log('Undefined Test Files =', allFiles); // eslint-disable-line no-console
  return allFiles;
}

function constructChunksWithFullFilePaths(chunks, files) {
  let finalChunks = [];

  chunks.forEach((chunk) => {
    let individualChunk = [];

    chunk.forEach((testFile) => {

      const result = files.find((fullFileName) => {
        return (fullFileName.indexOf(testFile) > -1);
      });
      individualChunk.push(result);
    });
    finalChunks.push(individualChunk);
  });

  console.log('All Chunks Configured =', finalChunks); // eslint-disable-line no-console
  return finalChunks;
}
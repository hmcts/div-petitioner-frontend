const event = require('codeceptjs').event;
const container = require('codeceptjs').container;
let exec = require('child_process').exec;
const CONF = require('config');
const sauceUsername = process.env.SAUCE_USERNAME || CONF.saucelabs.username;
const sauceKey = process.env.SAUCE_ACCESS_KEY || CONF.saucelabs.key;

function updateSauceLabsResult(result, sessionId) {
  console.log('SauceOnDemandSessionID=' + sessionId + ' job-name=div-petitioner-frontend'); /* eslint-disable-line no-console, prefer-template */
  return 'curl -X PUT -s -d \'{"passed": ' + result + '}\' -u ' + sauceUsername + ':' + sauceKey + ' https://eu-central-1.saucelabs.com/rest/v1/' + sauceUsername + '/jobs/' + sessionId;
}

module.exports = function() {

  // Setting test success on SauceLabs
  event.dispatcher.on(event.test.passed, () => {

    let sessionId = container.helpers('WebDriver').browser.sessionId;
    exec(updateSauceLabsResult('true', sessionId));

  });

  // Setting test failure on SauceLabs
  event.dispatcher.on(event.test.failed, (test) => {
    // eslint-disable-next-line no-console
    console.log('4 - ops');

    // eslint-disable-next-line no-console
    console.log(test.ctx.currentTest.title);// _currentRetry: 0,
    // eslint-disable-next-line no-console
    console.log(test.ctx.currentTest._retries);// _currentRetry: 0,
    // eslint-disable-next-line no-console
    console.log(test.ctx.currentTest._currentRetry);// _currentRetry: 0,
    // eslint-disable-next-line no-console
    console.log(test.ctx);// _currentRetry: 0,

    // eslint-disable-next-line no-console
    console.log('5 - ops');
    //TODO - do not merge to master

    let sessionId = container.helpers('WebDriver').browser.sessionId;
    exec(updateSauceLabsResult('false', sessionId));

  });
};

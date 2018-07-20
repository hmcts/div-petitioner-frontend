/* eslint-disable no-console */
'use strict';

const randomstring = require('randomstring');
const idamExpressTestHarness = require('@hmcts/div-idam-test-harness');

const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper');
let args = idamConfigHelper.getArgs();
const CONF = require('config');

let Helper = codecept_helper;

class IdamHelper extends Helper {

  _before() {
    if (CONF.features.idam) {
      const emailName = 'simulate-delivered-' + randomstring.generate({
        length: 16,
        charset: 'numeric'
      });
      const testEmail = emailName + '@notifications.service.gov.uk';
      const testPassword = randomstring.generate(9);

      args.testEmail = testEmail;
      args.testPassword = testPassword;

      idamConfigHelper.setTestEmail(testEmail);
      idamConfigHelper.setTestPassword(testPassword);

      return idamExpressTestHarness.createUser(args, process.env.E2E_IDAM_PROXY)
        .then(() => {
          console.log('Created IDAM test user: ' + testEmail);
          return;
        }).catch((err) => {
          console.log('Unable to create IDAM test user: ' + err);
          return;
        });
    }
  }

  _after() {
    if (CONF.features.idam) {
      return idamExpressTestHarness.removeUser(args, process.env.E2E_IDAM_PROXY)
        .then(() => {
          console.log('Removed IDAM test user: ' + args.testEmail);
          return;
        }).catch((err) => {
          console.log('Unable to remove IDAM test user: ' + err);
          return;
        });
    }
  }
}

module.exports = IdamHelper;
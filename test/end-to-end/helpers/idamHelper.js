'use strict';

const logger = require('app/services/logger').logger(__filename);
const randomstring = require('randomstring');
const idamExpressTestHarness = require('@hmcts/div-idam-test-harness');

const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper');
let args = idamConfigHelper.getArgs();
const CONF = require('config');

let Helper = codecept_helper;

class IdamHelper extends Helper {

  _before() {
    if (CONF.features.idam) {
      const randomString = randomstring.generate({
        length: 16,
        charset: 'numeric'
      });
      const emailName = `hmcts.divorce.reform+pfe-automatedtest-${randomString}`;
      const testEmail = `${emailName}@gmail.com`;
      const testPassword = randomstring.generate(9);

      args.testEmail = testEmail;
      args.testPassword = testPassword;

      idamConfigHelper.setTestEmail(testEmail);
      idamConfigHelper.setTestPassword(testPassword);

      return idamExpressTestHarness.createUser(args, process.env.E2E_IDAM_PROXY)
        .then(() => {
          logger.infoWithReq(null, 'idam_user_created', 'Created IDAM test user', testEmail);
          return;
        }).catch((err) => {
          logger.warnWithReq(null, 'idam_user_create_error', 'Unable to create IDAM test user', err);
          return;
        });
    }
  }

  _after() {
    if (CONF.features.idam) {
      return idamExpressTestHarness.removeUser(args, process.env.E2E_IDAM_PROXY)
        .then(() => {
          logger.infoWithReq(null, 'idam_user_removed', 'Removed IDAM test user', args.testEmail);
          return;
        }).catch((err) => {
          logger.warnWithReq(null, 'idam_user_remove_error', 'Unable to remove IDAM test user', err);
          return;
        });
    }
  }
}

module.exports = IdamHelper;
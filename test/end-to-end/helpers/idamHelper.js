'use strict';

const logger = require('app/services/logger').logger(__filename);
const randomstring = require('randomstring');
const idamExpressTestHarness = require('@hmcts/div-idam-test-harness');

const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper');
let args = idamConfigHelper.getArgs();
const CONF = require('config');
const parseBool = require('app/core/utils/parseBool');

let Helper = codecept_helper;

class IdamHelper extends Helper {

  _before() {
    if (parseBool(CONF.features.idam)) {
      const randomString = randomstring.generate({
        length: 16,
        charset: 'numeric'
      });
      const emailName = `divorce+pfe-test-${randomString}`;
      const testEmail = `${emailName}@mailinator.com`;
      const testPassword = 'genericPassword123';

      args.testEmail = testEmail;
      args.testPassword = testPassword;
      args.testGroupCode = 'citizens';
      args.roles = [{ code: 'citizen' }];

      idamConfigHelper.setTestEmail(testEmail);
      idamConfigHelper.setTestPassword(testPassword);

      return idamExpressTestHarness.createUser(args, process.env.E2E_IDAM_PROXY)
        .then(() => {
          logger.infoWithReq(null, 'idam_user_created', 'Created IDAM test user', testEmail);
        }).catch((err) => {
          logger.warnWithReq(null, 'idam_user_create_error', 'Unable to create IDAM test user', err);
          throw err ;
        });
    }
  }

  _after() {
    if (parseBool(CONF.features.idam)) {
      idamExpressTestHarness.removeUser(args, process.env.E2E_IDAM_PROXY)
        .then(() => {
          logger.infoWithReq(null, 'idam_user_removed', 'Removed IDAM test user', args.testEmail);
        }).catch((err) => {
          logger.warnWithReq(null, 'idam_user_remove_error', 'Unable to remove IDAM test user', err);
          throw err;
        });
    }
  }
}

module.exports = IdamHelper;

/* eslint-disable no-console */
'use strict';

const randomstring = require('randomstring');
const idamExpressTestHarness = require('@hmcts/div-idam-test-harness');

const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper');
let args = idamConfigHelper.getArgs();
const CONF = require('config');
const parseBool = require('app/core/utils/parseBool');

let Helper = codecept_helper;

class IdamHelper extends Helper {

  async _before() {
    if (parseBool(CONF.features.idam)) {
      // Codecept doesn't retry _before() steps even if a .retry() is added to the Scenario.
      // So the below will retry creating a test user if IDAM fails.
      const maxRetries = 2;
      let i;
      for (i = 1; i <= maxRetries; i++) {

        try {
          console.log(`Creating IDAM test user (attempt ${i} of ${maxRetries+1})...`);
          await this.createUser();
          break;
        } catch (err) {
          if (i < maxRetries) {
            console.log('Failed to create IDAM test user. Retrying...');
          } else {
            console.error(`ERROR: Could not create IDAM test user after '${i+1}' attempts.`);
            throw err ;
          }
        }
      }
    }
  }

  createUser() {
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
        console.log('Created IDAM test user:', testEmail);
      }).catch((err) => {
        console.error('ERROR: Unable to create IDAM test user:', err);
        throw err ;
      });
  }

  _after() {
    if (parseBool(CONF.features.idam)) {
      console.log('Removing IDAM test user...');
      const testEmail = args.testEmail;
      idamExpressTestHarness.removeUser(args, process.env.E2E_IDAM_PROXY)
        .then(() => {
          console.log('IDAM test user removed:', testEmail);
        }).catch((err) => {
          console.error('ERROR: Unable to remove IDAM test user:', err);
        });
    }
  }
}

module.exports = IdamHelper;

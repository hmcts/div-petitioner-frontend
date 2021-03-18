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

  async retrieveOrCreateNewUser() {
    if (parseBool(CONF.features.idam)) {
      let user;

      if (idamConfigHelper.getTestEmail()) { //TODO - make this better
        console.log(`Reusing user ${idamConfigHelper.getTestEmail()}`);
        user = { username: idamConfigHelper.getTestEmail(), password: idamConfigHelper.getTestPassword() };//TODO - create get user function
      } else {
        console.log('Creating new user');

        console.log('Attempting to create IDAM test user...');//TODO - put retry when calling this helper - https://codecept.io/helpers/#conditional-retries

        const randomString = randomstring.generate({
          length: 16,
          charset: 'numeric'
        });
        const emailName = `divorce+pfe-test-${randomString}`;
        const testEmail = `${emailName}@mailinator.com`;
        const testPassword = 'genericPassword123';

        args.testEmail = testEmail;
        args.testPassword = testPassword;
        args.roles = [{ code: 'citizen' }];

        try {
          await idamExpressTestHarness.createUser(args, process.env.E2E_IDAM_PROXY);
          console.log('Created IDAM test user:', testEmail);

          idamConfigHelper.setTestEmail(testEmail);//TODO this might be inefficient - have another look later
          idamConfigHelper.setTestPassword(testPassword);

          user = { username: idamConfigHelper.getTestEmail(), password: idamConfigHelper.getTestPassword() };

        } catch (err) {
          console.error('ERROR: Unable to create IDAM test user:', err);
          throw err;
        }
      }

      return user;
    } else {
      console.log('IDAM feature is switched off. Test user will not be created.');
    }
  }

  //TODO - _finishTest???
  // _after() {//TODO - how to clean up after ourselves? - have a flag or list of users and clean it up as last - do it asynchronously (have test as function and get rid of user myself... - then I'd lose the benefit)
  //   if (parseBool(CONF.features.idam)) {//
  //     console.log('Removing IDAM test user...');
  //     const testEmail = args.testEmail;
  //     idamExpressTestHarness.removeUser(args, process.env.E2E_IDAM_PROXY)
  //       .then(() => {
  //         console.log('IDAM test user removed:', testEmail);
  //         //TODO - maybe I should remove user from list here
  //       }).catch((err) => {
  //         // console.error('ERROR: Unable to remove IDAM test user:', err);
  //         console.error('ERROR: Unable to remove IDAM test user:');
  //       });
  //   }
  // }
}

module.exports = IdamHelper;

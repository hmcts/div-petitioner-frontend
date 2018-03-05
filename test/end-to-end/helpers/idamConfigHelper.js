'use strict';

const CONF = require('config');

let args = {
  idamApiUrl: process.env.IDAM_API_URL || CONF.idamArgs.idamApiUrl,
  accountsEndpoint: process.env.IDAM_TEST_SUPPORT_CREATE_ACCOUNT_ENDPOINT || CONF.idamArgs.idamTestSupportCreateAccountEndpoint,
  testForename: process.env.IDAM_TEST_FORENAME || CONF.idamArgs.idamTestForename,
  testSurname: process.env.IDAM_TEST_SURNAME || CONF.idamArgs.idamTestSurname,
  testUserGroup: process.env.IDAM_TEST_USER_GROUP || CONF.idamArgs.idamTestUserGroup,
  testLevelOfAccess: process.env.IDAM_TEST_LEVEL_OF_ACCESS || CONF.idamArgs.idamTestLevelOfAccess
};

let testEmail;
let testPassword;

const getArgs = () => {
  return args;
};

const setTestEmail = (email) => {
  testEmail = email;
};

const setTestPassword = (password) => {
  testPassword = password;
};

const getTestEmail = () => {
  return process.env.E2E_IDAM_USERNAME || testEmail;
};

const getTestPassword = () => {
  return process.env.E2E_IDAM_PASSWORD || testPassword;
};

module.exports = { getArgs, setTestEmail, setTestPassword, getTestEmail, getTestPassword };
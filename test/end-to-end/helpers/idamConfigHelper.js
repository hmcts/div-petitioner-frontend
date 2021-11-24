'use strict';

const CONF = require('config');

let args = {
  idamApiUrl: CONF.idamArgs.idamApiUrl,
  accountsEndpoint: CONF.idamArgs.idamTestSupportCreateAccountEndpoint,
  testForename: CONF.idamArgs.idamTestForename,
  testSurname: CONF.idamArgs.idamTestSurname,
  testUserGroup: CONF.idamArgs.idamTestUserGroup,
  testLevelOfAccess: CONF.idamArgs.idamTestLevelOfAccess
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

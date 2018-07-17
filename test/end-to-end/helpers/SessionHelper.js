/* eslint-disable no-console */

const unirest = require('unirest');
const { assert } = require('chai');
const basicDivorceSessionData = require('test/end-to-end/data/basicDivorceSessionData.js');
const Tokens = require('csrf');
const CONF = require('config');

class SessionHelper extends codecept_helper {

  async getTheSession(connectSidCookie, authTokenCookie) {
    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];
    const proxyUrl = process.env.E2E_PROXY_SERVER ? `http://${process.env.E2E_PROXY_SERVER}` : '';
    let cookieHeaders = {'Cookie': `${connectSidCookie.name}=${connectSidCookie.value}`};

    if (authTokenCookie) {
      cookieHeaders.Cookie = `${cookieHeaders.Cookie}; ${authTokenCookie.name}=${authTokenCookie.value}`;
    }

    return await new Promise((resolve) => {
      unirest.get(`${helper.config.url}/session`)
        .headers(cookieHeaders)
        .strictSSL(false)
        .proxy(proxyUrl)
        .end((response) => {
          // console.log('### SESSION GET:', response.body);
          resolve(response.body);
        });
    });
  }

  async setTheSession (connectSidCookie, authTokenCookie, session) {
    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];
    const tokens = new Tokens();
    const csrfToken = tokens.create(session.csrfSecret);
    const proxyUrl = process.env.E2E_PROXY_SERVER ? `http://${process.env.E2E_PROXY_SERVER}` : '';
    let cookieHeaders = {
      'Cookie': `${connectSidCookie.name}=${connectSidCookie.value}`,
      'X-CSRF-token': csrfToken,
      'Content-Type': 'application/json'
    };

    if (authTokenCookie) {
      cookieHeaders.Cookie = `${cookieHeaders.Cookie}; ${authTokenCookie.name}=${authTokenCookie.value}`;
    }

    return await new Promise((resolve) => {
      unirest.post(`${helper.config.url}/session`)
        .headers(cookieHeaders)
        .send(JSON.stringify(session))
        .strictSSL(false)
        .proxy(proxyUrl)
        .end((response) => {
          console.log(`### SESSION SET: ${response.body}`);
          resolve();
        });
    });
  }

  //
  // Verify basicDivorceSessionData.js is still valid for the benefit
  // of other test's setup.
  //
  async assertSessionEqualsMockTestData() {
    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];
    const connectSidCookie = await helper.grabCookie('connect.sid');
    const authTokenCookie = await helper.grabCookie('__auth-token');
    const session = await this.getTheSession(connectSidCookie, authTokenCookie);

    let expectedSession = this.updateExpectedSessionWithActualSession(basicDivorceSessionData, session);

    return assert.deepEqual(session, expectedSession);
  }

  async haveABasicSession() {
    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];
    const connectSidCookie = await helper.grabCookie('connect.sid');
    const authTokenCookie = await helper.grabCookie('__auth-token');
    const session = await this.getTheSession(connectSidCookie, authTokenCookie);

    let basicSession = this.updateExpectedSessionWithActualSession(basicDivorceSessionData, session);

    await this.setTheSession(connectSidCookie, authTokenCookie, basicSession);
  }

  updateExpectedSessionWithActualSession(expectedSession, actualSession) {
    const testingLocally = CONF.e2e.frontendUrl.indexOf('localhost:8080') > -1;

    expectedSession.csrfSecret                                = actualSession.csrfSecret;
    expectedSession.expires                                   = actualSession.expires;
    expectedSession.cookie.domain                             = actualSession.cookie.domain;
    expectedSession.petitionerHomeAddress.addresses           = actualSession.petitionerHomeAddress.addresses;
    expectedSession.petitionerCorrespondenceAddress.addresses = actualSession.petitionerCorrespondenceAddress.addresses;
    expectedSession.respondentHomeAddress.addresses           = actualSession.respondentHomeAddress.addresses;
    expectedSession.respondentCorrespondenceAddress.addresses = actualSession.respondentCorrespondenceAddress.addresses;
    expectedSession.marriageCertificateFiles[0].createdBy     = actualSession.marriageCertificateFiles[0].createdBy;
    expectedSession.marriageCertificateFiles[0].createdOn     = actualSession.marriageCertificateFiles[0].createdOn;
    expectedSession.marriageCertificateFiles[0].lastModifiedBy= actualSession.marriageCertificateFiles[0].lastModifiedBy;
    expectedSession.marriageCertificateFiles[0].modifiedOn    = actualSession.marriageCertificateFiles[0].modifiedOn;
    expectedSession.marriageCertificateFiles[0].fileUrl       = actualSession.marriageCertificateFiles[0].fileUrl;
    expectedSession.marriageCertificateFiles[0].mimeType      = actualSession.marriageCertificateFiles[0].mimeType;

    if (!testingLocally) {
      expectedSession.fetchedDraft                            = actualSession.fetchedDraft;
      expectedSession.petitionerEmail                         = actualSession.petitionerEmail;
    }

    return expectedSession;
  }

}

module.exports = SessionHelper;
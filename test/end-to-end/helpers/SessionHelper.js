/* eslint-disable no-console */

const unirest = require('unirest');
const { assert } = require('chai');
const basicDivorceSessionData = require('test/end-to-end/data/basicDivorceSessionData.js');
const Tokens = require('csrf');

class SessionHelper extends codecept_helper {

  async getTheSession(cookie) {
    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];

    return await new Promise((resolve) => {
      unirest.get(`${helper.config.url}/session`)
        .headers({'Cookie': `${cookie.name}=${cookie.value}`})
        .strictSSL(false)
        .end((response) => {
          console.log(`### SESSION GET: ${response.body}`);
          resolve(response.body);
        });
    });
  }

  async setTheSession (cookie, session) {
    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];
    const tokens = new Tokens();
    const csrfToken = tokens.create(session.csrfSecret);

    return await new Promise((resolve) => {
      unirest.post(`${helper.config.url}/session`)
        .headers({
          'Cookie':`${cookie.name}=${cookie.value}`,
          'X-CSRF-token': csrfToken,
          'Content-Type': 'application/json'
        })
        .send(JSON.stringify(session))
        .strictSSL(false)
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
  async assertSessionEqualsTestData() {
    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];
    const connectSidCookie = await helper.grabCookie('connect.sid');
    const session = await this.getTheSession(connectSidCookie);

    let expectedSession = this.updateSessionWithGeneratedData(basicDivorceSessionData, session);

    return assert.deepEqual(session, expectedSession);
  }

  async haveABasicSession() {
    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];
    const connectSidCookie = await helper.grabCookie('connect.sid');
    const session = await this.getTheSession(connectSidCookie);

    let basicSession = this.updateSessionWithGeneratedData(basicDivorceSessionData, session);

    await this.setTheSession(connectSidCookie, basicSession);
  }

  updateSessionWithGeneratedData(sessionToUpdate, generatedSession) {
    sessionToUpdate.csrfSecret                              = generatedSession.csrfSecret;
    sessionToUpdate.expires                                 = generatedSession.expires;
    sessionToUpdate.marriageCertificateFiles.createdBy      = generatedSession.marriageCertificateFiles.createdBy;
    sessionToUpdate.marriageCertificateFiles.createdOn      = generatedSession.marriageCertificateFiles.createdOn;
    sessionToUpdate.marriageCertificateFiles.lastModifiedBy = generatedSession.marriageCertificateFiles.lastModifiedBy;
    sessionToUpdate.marriageCertificateFiles.modifiedOn     = generatedSession.marriageCertificateFiles.modifiedOn;
    sessionToUpdate.marriageCertificateFiles.fileUrl        = generatedSession.marriageCertificateFiles.fileUrl;
    return sessionToUpdate;
  }

}

module.exports = SessionHelper;
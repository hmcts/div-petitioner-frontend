const unirest = require('unirest');
const { assert } = require('chai');
const paymentDivorceCcdCaseData = require('test/end-to-end/data/paymentDivorceCcdCaseData.js');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const logger = require('log4js').getLogger();

class CcdCaseHelper extends codecept_helper {

  async getTheCcdCase(caseId, authTokenCookie) {
    const ccdUrl = 'https://gateway-ccd.nonprod.platform.hmcts.net/print/jurisdictions/DIVORCE/case-types/DIVORCE/cases';
    const proxyUrl = process.env.E2E_PROXY_SERVER ? `http://${process.env.E2E_PROXY_SERVER}` : '';
    const headers = { 'Authorization': `Bearer ${authTokenCookie.value}` };
    return await new Promise((resolve) => {
      unirest.get(`${ccdUrl}/${caseId}`)
        .headers(headers)
        .strictSSL(false)
        .proxy(proxyUrl)
        .end((response) => {
          const decodedResponse = entities.decode(response.body);
          const caseDataString = decodedResponse.match(/{(?:\n|.)*}/);
          const caseData = JSON.parse(caseDataString);
          logger.info('### CCD CASE GET: done');
          logger.debug('### CCD CASE GET:', caseData);
          resolve(caseData);
        });
    });
  }

  async assertCorrectCaseIsInCcd(caseId, authTokenCookie, caseType) {
    const ccdCase = await this.getTheCcdCase(caseId, authTokenCookie);
    let expectedSession = this.updateExpectedCaseWithActualCcdCase(paymentDivorceCcdCaseData, ccdCase, caseType);

    return assert.deepEqual(ccdCase, expectedSession);
  }

  updateExpectedCaseWithActualCcdCase(expectedCase, actualCcdCase, caseType) {
    expectedCase.id                                                       = actualCcdCase.id;
    expectedCase.created_date                                             = actualCcdCase.created_date;
    expectedCase.last_modified                                            = actualCcdCase.last_modified;
    expectedCase.case_data.D8PetitionerEmail                              = actualCcdCase.case_data.D8PetitionerEmail;
    expectedCase.case_data.createdDate                                    = actualCcdCase.case_data.createdDate;
    expectedCase.case_data.D8DivorceUnit                                  = actualCcdCase.case_data.D8DivorceUnit;

    if (caseType.toLowerCase() === 'hwf') {
      expectedCase.state                                                  = 'AwaitingHWFDecision';
      expectedCase.case_data.D8HelpWithFeesNeedHelp                       = actualCcdCase.case_data.D8HelpWithFeesNeedHelp;
      expectedCase.case_data.D8HelpWithFeesAppliedForFees                 = actualCcdCase.case_data.D8HelpWithFeesNeedHelp;
      expectedCase.case_data.D8HelpWithFeesReferenceNumber                = actualCcdCase.case_data.D8HelpWithFeesReferenceNumber;
      expectedCase.data_classification.D8HelpWithFeesAppliedForFees       = actualCcdCase.data_classification.D8HelpWithFeesAppliedForFees;
      expectedCase.data_classification.D8HelpWithFeesReferenceNumber      = actualCcdCase.data_classification.D8HelpWithFeesReferenceNumber;
      expectedCase.security_classifications.D8HelpWithFeesAppliedForFees  = actualCcdCase.security_classifications.D8HelpWithFeesAppliedForFees;
      expectedCase.security_classifications.D8HelpWithFeesReferenceNumber = actualCcdCase.security_classifications.D8HelpWithFeesReferenceNumber;
      delete expectedCase.case_data.Payments;
      delete expectedCase.data_classification.Payments;
      delete expectedCase.security_classifications.Payments;

    } else {
      expectedCase.case_data.Payments[0].id                               = actualCcdCase.case_data.Payments[0].id;
      expectedCase.case_data.Payments[0].value.PaymentDate                = actualCcdCase.case_data.Payments[0].value.PaymentDate;
      expectedCase.case_data.Payments[0].value.PaymentSiteId              = actualCcdCase.case_data.Payments[0].value.PaymentSiteId;
      expectedCase.case_data.Payments[0].value.PaymentReference           = actualCcdCase.case_data.Payments[0].value.PaymentReference;
      expectedCase.case_data.Payments[0].value.PaymentTransactionId       = actualCcdCase.case_data.Payments[0].value.PaymentTransactionId;
      expectedCase.data_classification.Payments.value[0].id               = actualCcdCase.data_classification.Payments.value[0].id;
      expectedCase.security_classifications.Payments.value[0].id          = actualCcdCase.security_classifications.Payments.value[0].id;
    }

    return expectedCase;
  }

}

module.exports = CcdCaseHelper;
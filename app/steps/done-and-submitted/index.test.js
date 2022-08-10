const request = require('supertest');
const { expectSessionValue, testContent, testExistence, testNonExistence, testCustom, testMultipleValuesExistence } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const { expect } = require('test/util/chai');
const serviceCentreCourt = require('test/examples/courts/serviceCentre');
const courts = require('test/examples/courts/courts');

const modulePath = 'app/steps/done-and-submitted';

const content = require(`${modulePath}/content`);
const config = require('config');

const finOrderFee = config.commonProps.financialOrderApplicationFee;

const contentStrings = content.resources.en.translation.content;

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  const allocatedCourt = serviceCentreCourt;
  const court = courts;

  beforeEach(() => {
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.DoneAndSubmitted;
  });

  describe('Help with fees', () => {
    let session = {};

    beforeEach(done => {
      session = {
        paymentMethod: 'hwf',
        caseId: 'ABC'
      };
      withSession(done, agent, session);
    });

    it('does not show successful text', done => {
      testNonExistence(done, agent, underTest,
        contentStrings.paymentSuccessful);
    });

    it('shows case reference text', done => {
      testExistence(done, agent, underTest, contentStrings.caseReferenceNumber);
    });

    it('shows case reference number', done => {
      testExistence(done, agent, underTest, session.caseId);
    });
  });

  describe('Payment', () => {
    let session = {};

    context('payment is completed', () => {
      beforeEach(done => {
        session = {
          divorceWho: 'wife',
          paymentMethod: 'card-online',
          currentPaymentId: '1',
          payments: { 1: { status: 'success' } },
          allocatedCourt,
          caseId: 'ABC'
        };
        withSession(done, agent, session);
      });

      it('shows successful text', done => {
        testExistence(done, agent, underTest, contentStrings.paymentSuccessful);
      });

      it('shows case reference text', done => {
        testExistence(done, agent, underTest,
          contentStrings.caseReferenceNumber);
      });

      it('shows case reference number', done => {
        testExistence(done, agent, underTest, session.caseId);
      });
    });
  });

  describe('Financial order', () => {
    let excludeKeys = {};
    let session = {};

    beforeEach(() => {
      excludeKeys = [
        'paymentSuccessful',
        'emailConfirmation',
        'whatToDoNow',
        'whatToDoNowReferenceNumber',
        'whatToDoNowRefNumText',
        'whatToDoNowOrigCert',
        'whatToDoNowNameChange',
        'whatToDoNowCertTrans',
        'whatToDoNowRefNumPrtScr',
        'whatToDoNowPostHeading',
        'whatToDoNowPostText',
        'whatToDoNowPostText2',
        'whatToDoNowOrigCertOnly',
        'helpWithFees',
        'courtCheckApp',
        'youWillBeContacted',
        'certificateKept',
        'sendEmail',
        'email',
        'emailTo',
        'amendedApplictionTitle',
        'amendedCourtCheck',
        'amendedAmendedApplication',
        'amendedUsedAdultery',
        'amendedContactUs',
        'amendedPostDocsResponse',
        'amendedPostDocsSubmitDocuments',
        'amendedPostDocsOriginalDocs',
        'amendedPostDocsWarning',
        'amendedPostDocsReferenceNumber',
        'amendedPostDocsCheckResponse'
      ];
    });

    context('Financial order is Yes', () => {
      beforeEach(done => {
        session = {
          caseId: '123',
          divorceWho: 'husband',
          financialOrder: 'Yes',
          financialOrderApplicationFee: finOrderFee
        };

        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        excludeKeys.push('consentOrder');
        excludeKeys.push('settle');

        testContent(done, agent, underTest, content,
          session, excludeKeys);
      });
    });

    context('Financial order is No', () => {
      beforeEach(done => {
        session = {
          caseId: '123',
          divorceWho: 'husband',
          financialOrder: 'No',
          marriageCertificateFiles: '123'
        };

        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        excludeKeys.push('startFinancialProceedings1');
        excludeKeys.push('startFinancialProceedings2');

        testContent(done, agent, underTest, content,
          session, excludeKeys);
      });
    });
  });

  describe('when respondent is husband', () => {
    let session = {};

    beforeEach(done => {
      session = {
        reasonForDivorce: 'adultery',
        petitionerNameDifferentToMarriageCertificate: 'No',
        divorceWho: 'husband',
        reasonForDivorceAdulteryWishToName: 'Yes',
        financialOrder: 'No'
      };

      withSession(done, agent, session);
    });

    it('contains references to husband', done => {
      testExistence(done, agent, underTest, 'husband');
    });

    it('does not contain references to wife', done => {
      testNonExistence(done, agent, underTest, 'wife');
    });
  });

  describe('when respondent is wife', () => {
    let session = {};

    beforeEach(done => {
      session = {
        reasonForDivorce: 'adultery',
        petitionerNameDifferentToMarriageCertificate: 'No',
        divorceWho: 'wife',
        reasonForDivorceAdulteryWishToName: 'Yes',
        financialOrder: 'No'
      };

      withSession(done, agent, session);
    });

    it('contains references to wife', done => {
      testExistence(done, agent, underTest, 'wife');
    });

    it('does not contain references to husband', done => {
      testNonExistence(done, agent, underTest, 'husband');
    });
  });

  describe('should display allocated court info', () => {
    let session = {};

    beforeEach(done => {
      session = {
        reasonForDivorce: 'adultery',
        petitionerNameDifferentToMarriageCertificate: 'No',
        divorceWho: 'husband',
        reasonForDivorceAdulteryWishToName: 'Yes',
        financialOrder: 'No',
        allocatedCourt
      };

      withSession(done, agent, session);
    });

    it('contains allocated court e-mail three times', done => {
      testCustom(done, agent, underTest, [], response => {
        const timesEmailShouldAppearOnPage = 3;
        const emailOccurrencesInPage = response.text.match(new RegExp(allocatedCourt.email, 'g')).length;
        expect(emailOccurrencesInPage).to.equal(timesEmailShouldAppearOnPage);
      });
    });

    it('contains CTSC phone number', done => {
      testExistence(done, agent, underTest, config.commonProps.en.courtPhoneNumberEn);
    });

    it('contains CTSC opening hours', done => {
      testExistence(done, agent, underTest, config.commonProps.en.courtOpeningHourEn);
    });
  });

  describe('should retrieve allocated court for previously submitted case', () => {
    let session = {};

    beforeEach(done => {
      session = {
        reasonForDivorce: 'adultery',
        petitionerNameDifferentToMarriageCertificate: 'No',
        divorceWho: 'husband',
        reasonForDivorceAdulteryWishToName: 'Yes',
        financialOrder: 'No',
        courts: 'serviceCentre',
        court
      };

      withSession(done, agent, session);
    });

    it('allocated court is retrieved from court list', done => {
      testCustom(done, agent, underTest, [], () => {
        expectSessionValue('allocatedCourt', session.court[session.courts], agent, done);
      });
    });
  });

  describe('If user has NOT uploaded ANYTHING', () => {
    let excludeKeys = {};
    let session = {};

    beforeEach(() => {
      excludeKeys = [
        'paymentSuccessful',
        'emailConfirmation',
        'helpWithFees',
        'courtCheckApp',
        'youWillBeContacted',
        'startFinancialProceedings1',
        'startFinancialProceedings2',
        'amendedApplictionTitle',
        'amendedCourtCheck',
        'amendedAmendedApplication',
        'amendedUsedAdultery',
        'amendedContactUs',
        'amendedPostDocsResponse',
        'amendedPostDocsSubmitDocuments',
        'amendedPostDocsOriginalDocs',
        'amendedPostDocsWarning',
        'amendedPostDocsReferenceNumber',
        'amendedPostDocsCheckResponse'
      ];
    });

    context('Default - name change is NO and No translation because is married in UK', () => {
      beforeEach(done => {
        session = {
          marriageCertificateFiles: [],
          petitionerNameDifferentToMarriageCertificate: 'No',
          marriedInUk: 'Yes',
          divorceWho: 'husband'
        };

        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        excludeKeys.push('whatToDoNowRefNumText');
        excludeKeys.push('whatToDoNowOrigCert');
        excludeKeys.push('whatToDoNowNameChange');
        excludeKeys.push('whatToDoNowCertTrans');
        excludeKeys.push('whatToDoNowRefNumPrtScr');
        excludeKeys.push('whatToDoNowOrigCertOnly');

        testContent(done, agent, underTest, content,
          session, excludeKeys);
      });
    });

    context('Name change is Yes and No translation because is married in UK', () => {
      beforeEach(done => {
        session = {
          marriageCertificateFiles: [],
          petitionerNameDifferentToMarriageCertificate: 'Yes',
          marriedInUk: 'Yes',
          divorceWho: 'husband'
        };

        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        excludeKeys.push('whatToDoNowCertTrans');
        excludeKeys.push('whatToDoNowOrigCertOnly');

        testContent(done, agent, underTest, content,
          session, excludeKeys);
      });
    });

    context('Name change is No and got certificate translation', () => {
      beforeEach(done => {
        session = {
          marriageCertificateFiles: [],
          petitionerNameDifferentToMarriageCertificate: 'No',
          certifiedTranslation: 'Yes',
          divorceWho: 'husband'
        };

        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        excludeKeys.push('whatToDoNowNameChange');
        excludeKeys.push('whatToDoNowOrigCertOnly');

        testContent(done, agent, underTest, content,
          session, excludeKeys);
      });
    });

    context('Name change is Yes and got certificate translation', () => {
      beforeEach(done => {
        session = {
          marriageCertificateFiles: [],
          petitionerNameDifferentToMarriageCertificate: 'Yes',
          certifiedTranslation: 'Yes',
          divorceWho: 'husband'
        };

        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        excludeKeys.push('whatToDoNowOrigCertOnly');

        testContent(done, agent, underTest, content,
          session, excludeKeys);
      });
    });

    describe('should show allocated court\'s post address', () => {
      const careOfText = ' c/o';
      const htmlLineBreak = '<br/>';

      const contentRenderingTest = done => {
        excludeKeys.push('whatToDoNowRefNumText');
        excludeKeys.push('whatToDoNowOrigCert');
        excludeKeys.push('whatToDoNowNameChange');
        excludeKeys.push('whatToDoNowCertTrans');
        excludeKeys.push('whatToDoNowRefNumPrtScr');
        excludeKeys.push('whatToDoNowOrigCertOnly');
        testContent(done, agent, underTest, content, session, excludeKeys);
      };

      context('for service centre', () => {
        beforeEach(done => {
          session = {
            language: 'en',
            marriageCertificateFiles: [],
            petitionerNameDifferentToMarriageCertificate: 'No',
            marriedInUk: 'Yes',
            divorceWho: 'husband',
            allocatedCourt: serviceCentreCourt
          };

          withSession(done, agent, session);
        });

        it('renders the content from the content file', contentRenderingTest);

        it('should render post address correctly', done => {
          testMultipleValuesExistence(done, agent, underTest, [
            serviceCentreCourt.serviceCentreName + htmlLineBreak,
            careOfText,
            serviceCentreCourt.divorceCentre + htmlLineBreak,
            serviceCentreCourt.poBox + htmlLineBreak,
            serviceCentreCourt.courtCity + htmlLineBreak,
            serviceCentreCourt.postCode
          ]);
        });
      });

      context('for court with PO Box', () => {
        beforeEach(done => {
          session = {
            language: 'en',
            marriageCertificateFiles: [],
            petitionerNameDifferentToMarriageCertificate: 'No',
            marriedInUk: 'Yes',
            divorceWho: 'husband',
            allocatedCourt: {
              courtId: 'eastMidlands',
              divorceCentre: 'East Midlands Regional Divorce Centre',
              courtCity: 'Nottingham',
              poBox: 'PO Box 10447',
              postCode: 'NG2 9QN',
              openingHours: 'Telephone Enquiries from: 8.30am to 5pm',
              email: 'eastmidlandsdivorce@hmcts.gsi.gov.uk',
              phoneNumber: '0300 303 0642',
              siteId: 'AA01'
            }
          };

          withSession(done, agent, session);
        });

        it('renders the content from the content file', contentRenderingTest);

        it('should render post address correctly', done => {
          testMultipleValuesExistence(done, agent, underTest, [
            session.allocatedCourt.divorceCentre + htmlLineBreak,
            session.allocatedCourt.poBox + htmlLineBreak,
            session.allocatedCourt.courtCity + htmlLineBreak,
            session.allocatedCourt.postCode
          ]);
        });

        it('should not have c/o', done => {
          testNonExistence(done, agent, underTest, careOfText);
        });
      });

      context('for court without PO Box', () => {
        beforeEach(done => {
          session = {
            marriageCertificateFiles: [],
            petitionerNameDifferentToMarriageCertificate: 'No',
            marriedInUk: 'Yes',
            divorceWho: 'husband',
            allocatedCourt: {
              courtId: 'northWest',
              divorceCentre: 'North West Regional Divorce Centre',
              divorceCentreAddressName: 'Liverpool Civil & Family Court',
              courtCity: 'Liverpool',
              street: '35 Vernon Street',
              postCode: 'L2 2BX',
              openingHours: 'Telephone Enquiries from: 8.30am to 5pm',
              email: 'family@liverpool.countycourt.gsi.gov.uk',
              phoneNumber: '0300 303 0642',
              siteId: 'AA04'
            }
          };

          withSession(done, agent, session);
        });

        it('renders the content from the content file', contentRenderingTest);

        it('should render post address correctly', done => {
          testMultipleValuesExistence(done, agent, underTest, [
            session.allocatedCourt.divorceCentre + htmlLineBreak,
            session.allocatedCourt.divorceCentreAddressName,
            session.allocatedCourt.street + htmlLineBreak,
            session.allocatedCourt.courtCity + htmlLineBreak,
            session.allocatedCourt.postCode
          ]);
        });

        it('should not have c/o', done => {
          testNonExistence(done, agent, underTest, careOfText);
        });
      });
    });
  });

  describe('Dn Refusal amend journey - refusalRejectionReason is filled', () => {
    let session = {};
    let excludeKeys = [];

    beforeEach(done => {
      excludeKeys = [
        'paymentSuccessful',
        'whatToDoNow',
        'whatToDoNowReferenceNumber',
        'whatToDoNowRefNumText',
        'whatToDoNowOrigCert',
        'whatToDoNowNameChange',
        'whatToDoNowCertTrans',
        'whatToDoNowRefNumPrtScr',
        'whatToDoNowPostHeading',
        'whatToDoNowPostText',
        'certificateKept',
        'whatToDoNowOrigCertOnly',
        'sendEmail',
        'email',
        'emailTo',
        'courtWillCheck',
        'youCanFindMore',
        'contactTheCourt',
        'helpWithFees',
        'courtCheckApp',
        'youWillBeContacted',
        'consentOrder',
        'settle',
        'dividingMoney',
        'startFinancialProceedings1',
        'startFinancialProceedings2'
      ];

      session = {
        caseId: '123',
        divorceWho: 'husband',
        financialOrder: 'Yes',
        refusalRejectionReason: ['some reason'],
        petitionerEmail: 'simulate-delivered@notifications.service.gov.uk'
      };

      withSession(done, agent, session);
    });

    it('renders correct content if user has uploaded documents', done => {
      excludeKeys.push(
        'amendedPostDocsResponse',
        'amendedPostDocsSubmitDocuments',
        'amendedPostDocsOriginalDocs',
        'amendedPostDocsReferenceNumber',
        'amendedPostDocsWarning',
        'amendedPostDocsCheckResponse'
      );

      testContent(done, agent, underTest, content,
        session, excludeKeys);
    });

    it('renders the content if user has not uploaded documents', done => {
      excludeKeys.push(
        'whatHappensNext',
        'amendedCourtCheck',
        'amendedAmendedApplication',
        'amendedUsedAdultery',
        'amendedContactUs'
      );

      testContent(done, agent, underTest, content,
        session, excludeKeys);
    });
  });

  describe('Dn Refusal amend journey - refusalRejectionReason is NOT filled', () => {
    let session = {};

    beforeEach(done => {
      session = {
        caseId: '123',
        divorceWho: 'husband',
        financialOrder: 'Yes'
      };

      withSession(done, agent, session);
    });

    it('amend title not shown', done => {
      testNonExistence(done, agent, underTest,
        contentStrings.amendedApplictionTitle);
    });

    it('amend court check content not shown', done => {
      testNonExistence(done, agent, underTest,
        contentStrings.amendedCourtCheck);
    });
  });

  describe('should populate text content correctly', () => {
    const session = {};
    beforeEach(done => {
      const oneSecond = 1000;
      session.expires = Date.now() + oneSecond;
      withSession(done, agent, session);
    });


    it('display `Get Help description` text', done => {
      testExistence(done, agent, underTest,
        contentStrings.getHelpDescription);
    });

    it('display link for `How To Respond`', done => {
      testExistence(done, agent, underTest,
        contentStrings.howToRespondLink);
    });
  });
});

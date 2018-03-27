const request = require('supertest');
const { testContent, testExistence, testNonExistence } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const CONF = require('config');

const modulePath = 'app/steps/done-and-submitted';

const content = require(`${modulePath}/content`);

const contentStrings = content.resources.en.translation.content;
const featureTogglesMock = require('test/mocks/featureToggles');


let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    featureTogglesMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.DoneAndSubmitted;
  });


  afterEach(() => {
    s.http.close();
    featureTogglesMock.restore();
  });

  describe('Reference number', () => {
    let session = {};

    beforeEach(done => {
      session = { caseId: 'ABC' };
      withSession(done, agent, session);
    });

    it('shows reference number', done => {
      testExistence(done, agent, underTest, contentStrings.subTitle);
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
          courts: 'westMidlands'
        };
        withSession(done, agent, session);
      });

      it('shows complete status of payment', done => {
        testExistence(done, agent, underTest, contentStrings.paymentReceived);
      });
    });

    context('when payment is not yet completed (i.e cheque)', () => {
      beforeEach(done => {
        session = {
          divorceWho: 'wife',
          paymentMethod: 'cheque',
          courts: 'westMidlands'
        };
        withSession(done, agent, session);
      });

      it('does not show payment received', done => {
        testNonExistence(done, agent, underTest,
          contentStrings.paymentReceived);
      });
    });
  });

  describe('Financial order', () => {
    let excludeKeys = {};
    let session = {};

    beforeEach(() => {
      excludeKeys = [
        'paymentReceived',
        'emailConfirmation',
        'eastMidlandsEmail',
        'eastMidlandsPhoneNumber',
        'eastMidlandsOpeningHours',
        'southWestEmail',
        'southWestPhoneNumber',
        'southWestOpeningHours',
        'northWestEmail',
        'northWestPhoneNumber',
        'northWestOpeningHours',
        'courtCheckApp',
        'consentOrder',
        'settle',
        'helpWithFees',
        'courtCheckApp',
        'youWillBeContacted',
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
        'sendAddresseastMidlands',
        'sendAddresswestMidlands',
        'sendAddresssouthWest',
        'sendAddressnorthWest',
        'whatToDoNowOrigCertOnly',
        'stoke-on-trent'
      ];
    });

    context('Financial order is Yes', () => {
      beforeEach(done => {
        session = {
          caseId: '123',
          divorceWho: 'husband',
          financialOrder: 'Yes',
          courts: 'westMidlands'
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
          courts: 'westMidlands',
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
        financialOrder: 'No',
        courts: 'westMidlands'
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
        financialOrder: 'No',
        courts: 'westMidlands'
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

  const westMidlandsDetails = [
    CONF.commonProps.court.westMidlands.email,
    CONF.commonProps.court.westMidlands.phoneNumber
  ];
  const eastMidlandsDetails = [
    CONF.commonProps.court.eastMidlands.email,
    CONF.commonProps.court.eastMidlands.phoneNumber
  ];
  const southWestDetails = [
    CONF.commonProps.court.southWest.email,
    CONF.commonProps.court.southWest.phoneNumber
  ];
  const northWestDetails = [
    CONF.commonProps.court.northWest.email,
    CONF.commonProps.court.northWest.phoneNumber
  ];

  describe('when selected court is westMidlands', () => {
    let session = {};

    beforeEach(done => {
      session = {
        reasonForDivorce: 'adultery',
        petitionerNameDifferentToMarriageCertificate: 'No',
        divorceWho: 'husband',
        reasonForDivorceAdulteryWishToName: 'Yes',
        financialOrder: 'No',
        courts: 'westMidlands'
      };

      withSession(done, agent, session);
    });

    westMidlandsDetails.forEach(courtDetail => {
      it(`contains westMidlands contact detail: ${courtDetail}`, done => {
        testExistence(done, agent, underTest, courtDetail);
      });
    });

    it(`contains westMidlands contact detail: ${CONF.commonProps.court.westMidlands.openingHours}`, done => {
      testExistence(done, agent, underTest,
        CONF.commonProps.court.westMidlands.openingHours);
    });

    it('does not contain eastMidlands contact email', done => {
      testNonExistence(done, agent, underTest,
        CONF.commonProps.court.eastMidlands.email);
    });

    it('does not contain southWest contact email', done => {
      testNonExistence(done, agent, underTest,
        CONF.commonProps.court.southWest.email);
    });

    it('does not contain northWest contact email', done => {
      testNonExistence(done, agent, underTest,
        CONF.commonProps.court.northWest.email);
    });
  });

  describe('when selected court is eastMidlands', () => {
    let session = {};

    beforeEach(done => {
      session = {
        reasonForDivorce: 'adultery',
        petitionerNameDifferentToMarriageCertificate: 'No',
        divorceWho: 'husband',
        reasonForDivorceAdulteryWishToName: 'Yes',
        financialOrder: 'No',
        courts: 'eastMidlands'
      };

      withSession(done, agent, session);
    });

    eastMidlandsDetails.forEach(courtDetail => {
      it(`contains eastMidlands contact detail: ${courtDetail}`, done => {
        testExistence(done, agent, underTest, courtDetail);
      });
    });

    it(`contains eastMidlands contact detail: ${CONF.commonProps.court.eastMidlands.openingHours}`, done => {
      testExistence(done, agent, underTest,
        CONF.commonProps.court.eastMidlands.openingHours);
    });

    it('does not contain westMidlands contact email', done => {
      testNonExistence(done, agent, underTest,
        CONF.commonProps.court.westMidlands.email);
    });

    it('does not contain southWest contact email', done => {
      testNonExistence(done, agent, underTest,
        CONF.commonProps.court.southWest.email);
    });

    it('does not contain northWest contact email', done => {
      testNonExistence(done, agent, underTest,
        CONF.commonProps.court.northWest.email);
    });
  });

  describe('when selected court is southWest', () => {
    let session = {};

    beforeEach(done => {
      session = {
        reasonForDivorce: 'adultery',
        petitionerNameDifferentToMarriageCertificate: 'No',
        divorceWho: 'husband',
        reasonForDivorceAdulteryWishToName: 'Yes',
        financialOrder: 'No',
        courts: 'southWest'
      };

      withSession(done, agent, session);
    });

    southWestDetails.forEach(courtDetail => {
      it(`contains southWest contact detail: ${courtDetail}`, done => {
        testExistence(done, agent, underTest, courtDetail);
      });
    });

    it(`contains southWest contact detail: ${CONF.commonProps.court.southWest.openingHours}`, done => {
      testExistence(done, agent, underTest,
        CONF.commonProps.court.southWest.openingHours);
    });

    it('does not contain westMidlands contact email', done => {
      testNonExistence(done, agent, underTest,
        CONF.commonProps.court.westMidlands.email);
    });

    it('does not contain eastMidlands contact email', done => {
      testNonExistence(done, agent, underTest,
        CONF.commonProps.court.eastMidlands.email);
    });

    it('does not contain northWest contact email', done => {
      testNonExistence(done, agent, underTest,
        CONF.commonProps.court.northWest.email);
    });
  });

  describe('when selected court is northWest', () => {
    let session = {};

    beforeEach(done => {
      session = {
        reasonForDivorce: 'adultery',
        petitionerNameDifferentToMarriageCertificate: 'No',
        divorceWho: 'husband',
        reasonForDivorceAdulteryWishToName: 'Yes',
        financialOrder: 'No',
        courts: 'northWest'
      };

      withSession(done, agent, session);
    });

    northWestDetails.forEach(courtDetail => {
      it(`contains northWest contact detail: ${courtDetail}`, done => {
        testExistence(done, agent, underTest, courtDetail);
      });
    });

    it(`contains northWest contact detail: ${CONF.commonProps.court.northWest.openingHours}`, done => {
      testExistence(done, agent, underTest,
        CONF.commonProps.court.northWest.openingHours);
    });

    it('does not contain westMidlands contact email', done => {
      testNonExistence(done, agent, underTest,
        CONF.commonProps.court.westMidlands.email);
    });

    it('does not contain eastMidlands contact email', done => {
      testNonExistence(done, agent, underTest,
        CONF.commonProps.court.eastMidlands.email);
    });

    it('does not contain southWest contact email', done => {
      testNonExistence(done, agent, underTest,
        CONF.commonProps.court.westMidlands.email);
    });
  });

  describe('If user has NOT uploaded ANYTHING', () => {
    let excludeKeys = {};
    let session = {};

    beforeEach(() => {
      excludeKeys = [
        'paymentReceived',
        'subTitle',
        'emailConfirmation',
        'eastMidlandsEmail',
        'eastMidlandsPhoneNumber',
        'eastMidlandsOpeningHours',
        'westMidlandsEmail',
        'westMidlandsPhoneNumber',
        'westMidlandsOpeningHours',
        'southWestEmail',
        'southWestPhoneNumber',
        'southWestOpeningHours',
        'northWestEmail',
        'northWestPhoneNumber',
        'northWestOpeningHours',
        'courtCheckApp',
        'consentOrder',
        'settle',
        'helpWithFees',
        'courtCheckApp',
        'youWillBeContacted',
        'stoke-on-trent',
        'startFinancialProceedings1',
        'startFinancialProceedings2'
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
        excludeKeys.push('sendAddresseastMidlands');
        excludeKeys.push('sendAddresswestMidlands');
        excludeKeys.push('sendAddresssouthWest');
        excludeKeys.push('sendAddressnorthWest');

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
        excludeKeys.push('sendAddresseastMidlands');
        excludeKeys.push('sendAddresswestMidlands');
        excludeKeys.push('sendAddresssouthWest');
        excludeKeys.push('sendAddressnorthWest');

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
        excludeKeys.push('sendAddresseastMidlands');
        excludeKeys.push('sendAddresswestMidlands');
        excludeKeys.push('sendAddresssouthWest');
        excludeKeys.push('sendAddressnorthWest');

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
        excludeKeys.push('sendAddresseastMidlands');
        excludeKeys.push('sendAddresswestMidlands');
        excludeKeys.push('sendAddresssouthWest');
        excludeKeys.push('sendAddressnorthWest');

        testContent(done, agent, underTest, content,
          session, excludeKeys);
      });
    });

    context('If court selected East Midlands post address', () => {
      beforeEach(done => {
        session = {
          marriageCertificateFiles: [],
          petitionerNameDifferentToMarriageCertificate: 'No',
          marriedInUk: 'Yes',
          divorceWho: 'husband',
          courts: 'eastMidlands'
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
        excludeKeys.push('sendAddresswestMidlands');
        excludeKeys.push('sendAddresssouthWest');
        excludeKeys.push('sendAddressnorthWest');

        testContent(done, agent, underTest, content,
          session, excludeKeys);
      });
    });

    context('If court selected West Midlands post address', () => {
      beforeEach(done => {
        session = {
          marriageCertificateFiles: [],
          petitionerNameDifferentToMarriageCertificate: 'No',
          marriedInUk: 'Yes',
          divorceWho: 'husband',
          courts: 'westMidlands'
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
        excludeKeys.push('sendAddresseastMidlands');
        excludeKeys.push('sendAddresssouthWest');
        excludeKeys.push('sendAddressnorthWest');

        testContent(done, agent, underTest, content,
          session, excludeKeys);
      });
    });

    context('If court selected South West post address', () => {
      beforeEach(done => {
        session = {
          marriageCertificateFiles: [],
          petitionerNameDifferentToMarriageCertificate: 'No',
          marriedInUk: 'Yes',
          divorceWho: 'husband',
          courts: 'southWest'
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
        excludeKeys.push('sendAddresseastMidlands');
        excludeKeys.push('sendAddresswestMidlands');
        excludeKeys.push('sendAddressnorthWest');

        testContent(done, agent, underTest, content,
          session, excludeKeys);
      });
    });

    context('If court selected North West post address', () => {
      beforeEach(done => {
        session = {
          marriageCertificateFiles: [],
          petitionerNameDifferentToMarriageCertificate: 'No',
          marriedInUk: 'Yes',
          divorceWho: 'husband',
          courts: 'northWest'
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
        excludeKeys.push('sendAddresseastMidlands');
        excludeKeys.push('sendAddresswestMidlands');
        excludeKeys.push('sendAddresssouthWest');

        testContent(done, agent, underTest, content,
          session, excludeKeys);
      });
    });
  });
});

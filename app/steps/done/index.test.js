const request = require('supertest');
const { testContent, testExistence, testNonExistence } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const CONF = require('config');
const { expect, sinon } = require('test/util/chai');
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');

const modulePath = 'app/steps/done';

const content = require(`${modulePath}/content`);

const contentStrings = content.resources.en.translation.content;
const featureTogglesMock = require('test/mocks/featureToggles');


let s = {};
let agent = {};
let underTest = {};
const two = 2;

describe(modulePath, () => {
  beforeEach(() => {
    sinon.stub(applicationFeeMiddleware, 'updateApplicationFeeMiddleware')
      .callsArgWith(two);
    featureTogglesMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.Done;
  });


  afterEach(() => {
    s.http.close();
    featureTogglesMock.restore();
    applicationFeeMiddleware.updateApplicationFeeMiddleware.restore();
  });

  describe('#middleware', () => {
    it('returns updateApplicationFeeMiddleware in middleware', () => {
      expect(underTest.middleware
        .includes(applicationFeeMiddleware.updateApplicationFeeMiddleware))
        .to.eql(true);
    });
  });

  describe('when name is on certificate', () => {
    let session = {};

    beforeEach(done => {
      session = {
        reasonForDivorce: 'adultery',
        petitionerNameDifferentToMarriageCertificate: 'Yes',
        divorceWho: 'husband',
        reasonForDivorceAdulteryWishToName: 'Yes',
        courts: 'eastMidlands'
      };

      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const excludeKeys = [
        'copies1',
        'creditCard',
        'proofOfName',
        'cheque',
        'westmidlandsEmail',
        'southwestEmail',
        'northwestEmail',
        'westmidlandsPhone',
        'southwestPhone',
        'northwestPhone',
        'makeAlargeChange',
        'courtCheckApp',
        'startFinancialProceedings1',
        'startFinancialProceedings2'
      ];

      const dataContent = { numberOfCopies: '4' };

      testContent(done, agent, underTest, content,
        session, excludeKeys, dataContent);
    });
  });


  describe('when name is not on certificate', () => {
    let session = {};

    beforeEach(done => {
      session = {
        reasonForDivorce: 'adultery',
        petitionerNameDifferentToMarriageCertificate: 'Yes',
        divorceWho: 'husband',
        reasonForDivorceAdulteryWishToName: 'Yes',
        courts: 'westMidlands',
        petitionerNameChangedHow: ['deedPoll']
      };

      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const excludeKeys = [
        'copies1',
        'creditCard',
        'cheque',
        'eastmidlandsEmail',
        'southwestEmail',
        'northwestEmail',
        'eastmidlandsPhone',
        'southwestPhone',
        'northwestPhone',
        'makeAlargeChange',
        'courtCheckApp',
        'startFinancialProceedings1',
        'startFinancialProceedings2'
      ];
      const dataContent = { numberOfCopies: '4' };

      testContent(done, agent, underTest, content,
        session, excludeKeys, dataContent);
    });
  });

  describe('when pay method is card-phone', () => {
    let session = {};

    beforeEach(done => {
      session = {
        reasonForDivorce: 'adultery',
        petitionerNameDifferentToMarriageCertificate: 'Yes',
        divorceWho: 'husband',
        reasonForDivorceAdulteryWishToName: 'Yes',
        paymentMethod: 'card-phone',
        courts: 'westMidlands',
        petitionerNameChangedHow: ['deedPoll']
      };

      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const excludeKeys = [
        'copies1',
        'cheque',
        'eastmidlandsEmail',
        'southwestEmail',
        'northwestEmail',
        'eastmidlandsPhone',
        'southwestPhone',
        'northwestPhone',
        'makeAlargeChange',
        'courtCheckApp',
        'startFinancialProceedings1',
        'startFinancialProceedings2'
      ];

      const dataContent = { numberOfCopies: '4' };

      testContent(done, agent, underTest, content,
        session, excludeKeys, dataContent);
    });
  });

  describe('when pay method is cheque', () => {
    let session = {};

    beforeEach(done => {
      session = {
        reasonForDivorce: 'adultery',
        petitionerNameDifferentToMarriageCertificate: 'Yes',
        divorceWho: 'husband',
        reasonForDivorceAdulteryWishToName: 'Yes',
        paymentMethod: 'cheque',
        courts: 'westMidlands',
        petitionerNameChangedHow: ['deedPoll']
      };

      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const excludeKeys = [
        'copies1',
        'creditCard',
        'eastmidlandsEmail',
        'southwestEmail',
        'northwestEmail',
        'eastmidlandsPhone',
        'southwestPhone',
        'northwestPhone',
        'makeAlargeChange',
        'courtCheckApp',
        'startFinancialProceedings1',
        'startFinancialProceedings2'
      ];

      const dataContent = { numberOfCopies: '4' };

      testContent(done, agent, underTest, content,
        session, excludeKeys, dataContent);
    });
  });

  describe('when financial order is Yes', () => {
    let session = {};

    beforeEach(done => {
      session = {
        reasonForDivorce: 'adultery',
        petitionerNameDifferentToMarriageCertificate: 'Yes',
        divorceWho: 'husband',
        reasonForDivorceAdulteryWishToName: 'Yes',
        financialOrder: 'Yes',
        courts: 'westMidlands',
        petitionerNameChangedHow: ['deedPoll']
      };

      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const excludeKeys = [
        'copies1',
        'creditCard',
        'cheque',
        'eastmidlandsEmail',
        'southwestEmail',
        'northwestEmail',
        'eastmidlandsPhone',
        'southwestPhone',
        'northwestPhone',
        'makeAlargeChange',
        'courtCheckApp',
        'consentOrder',
        'settle'
      ];

      const dataContent = { numberOfCopies: '4' };

      testContent(done, agent, underTest, content,
        session, excludeKeys, dataContent);
    });
  });

  describe('when financial order is No', () => {
    let session = {};

    beforeEach(done => {
      session = {
        reasonForDivorce: 'adultery',
        petitionerNameDifferentToMarriageCertificate: 'Yes',
        divorceWho: 'husband',
        reasonForDivorceAdulteryWishToName: 'Yes',
        financialOrder: 'No',
        courts: 'westMidlands',
        petitionerNameChangedHow: ['deedPoll']
      };

      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const excludeKeys = [
        'copies1',
        'creditCard',
        'cheque',
        'eastmidlandsEmail',
        'southwestEmail',
        'northwestEmail',
        'eastmidlandsPhone',
        'southwestPhone',
        'northwestPhone',
        'makeAlargeChange',
        'courtCheckApp',
        'startFinancialProceedings1',
        'startFinancialProceedings2'
      ];

      const dataContent = { numberOfCopies: '4' };

      testContent(done, agent, underTest, content,
        session, excludeKeys, dataContent);
    });
  });

  describe('when petitioner has not changed name', () => {
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

    it('renders the content from the content file', done => {
      testNonExistence(done, agent, underTest, contentStrings.proofOfName);
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

    [
      CONF.commonProps.court.westMidlands.email,
      CONF.commonProps.court.westMidlands.phoneNumber
    ].forEach(courtDetail => {
      it(`does contain westMidlands contact detail: ${courtDetail}`, done => {
        testExistence(done, agent, underTest, courtDetail);
      });
    });

    [
      CONF.commonProps.court.eastMidlands.divorceCentre,
      CONF.commonProps.court.eastMidlands.poBox,
      CONF.commonProps.court.eastMidlands.courtCity,
      CONF.commonProps.court.eastMidlands.postCode,
      CONF.commonProps.court.eastMidlands.email
    ].forEach(courtDetail => {
      it(`does not contain eastMidlands contact detail: ${courtDetail}`, done => {
        testNonExistence(done, agent, underTest, courtDetail);
      });
    });

    [
      CONF.commonProps.court.southWest.divorceCentre,
      CONF.commonProps.court.southWest.poBox,
      CONF.commonProps.court.southWest.courtCity,
      CONF.commonProps.court.southWest.postCode,
      CONF.commonProps.court.southWest.email
    ].forEach(courtDetail => {
      it(`does not contain southWest contact detail: ${courtDetail}`, done => {
        testNonExistence(done, agent, underTest, courtDetail);
      });
    });

    [
      CONF.commonProps.court.northWest.divorceCentre,
      CONF.commonProps.court.northWest.poBox,
      CONF.commonProps.court.northWest.courtCity,
      CONF.commonProps.court.northWest.postCode,
      CONF.commonProps.court.northWest.email
    ].forEach(courtDetail => {
      it(`does not contain northWest contact detail: ${courtDetail}`, done => {
        testNonExistence(done, agent, underTest, courtDetail);
      });
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

    [
      CONF.commonProps.court.eastMidlands.email,
      CONF.commonProps.court.eastMidlands.phoneNumber
    ].forEach(courtDetail => {
      it(`does contain eastMidlands contact detail: ${courtDetail}`, done => {
        testExistence(done, agent, underTest, courtDetail);
      });
    });

    [
      CONF.commonProps.court.westMidlands.divorceCentre,
      CONF.commonProps.court.westMidlands.poBox,
      CONF.commonProps.court.westMidlands.courtCity,
      CONF.commonProps.court.westMidlands.postCode,
      CONF.commonProps.court.westMidlands.email
    ].forEach(courtDetail => {
      it(`does not contain westMidlands contact detail: ${courtDetail}`, done => {
        testNonExistence(done, agent, underTest, courtDetail);
      });
    });

    [
      CONF.commonProps.court.southWest.divorceCentre,
      CONF.commonProps.court.southWest.poBox,
      CONF.commonProps.court.southWest.courtCity,
      CONF.commonProps.court.southWest.postCode,
      CONF.commonProps.court.southWest.email
    ].forEach(courtDetail => {
      it(`does not contain southWest contact detail: ${courtDetail}`, done => {
        testNonExistence(done, agent, underTest, courtDetail);
      });
    });

    [
      CONF.commonProps.court.northWest.divorceCentre,
      CONF.commonProps.court.northWest.poBox,
      CONF.commonProps.court.northWest.courtCity,
      CONF.commonProps.court.northWest.postCode,
      CONF.commonProps.court.northWest.email
    ].forEach(courtDetail => {
      it(`does not contain northWest contact detail: ${courtDetail}`, done => {
        testNonExistence(done, agent, underTest, courtDetail);
      });
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

    [
      CONF.commonProps.court.southWest.email,
      CONF.commonProps.court.southWest.phoneNumber
    ].forEach(courtDetail => {
      it(`does contain southWest contact detail: ${courtDetail}`, done => {
        testExistence(done, agent, underTest, courtDetail);
      });
    });

    [
      CONF.commonProps.court.westMidlands.divorceCentre,
      CONF.commonProps.court.westMidlands.poBox,
      CONF.commonProps.court.westMidlands.courtCity,
      CONF.commonProps.court.westMidlands.postCode,
      CONF.commonProps.court.westMidlands.email
    ].forEach(courtDetail => {
      it(`does not contain westMidlands contact detail: ${courtDetail}`, done => {
        testNonExistence(done, agent, underTest, courtDetail);
      });
    });

    [
      CONF.commonProps.court.eastMidlands.divorceCentre,
      CONF.commonProps.court.eastMidlands.poBox,
      CONF.commonProps.court.eastMidlands.courtCity,
      CONF.commonProps.court.eastMidlands.postCode,
      CONF.commonProps.court.eastMidlands.email
    ].forEach(courtDetail => {
      it(`does not contain eastMidlands contact detail: ${courtDetail}`, done => {
        testNonExistence(done, agent, underTest, courtDetail);
      });
    });

    [
      CONF.commonProps.court.northWest.divorceCentre,
      CONF.commonProps.court.northWest.poBox,
      CONF.commonProps.court.northWest.courtCity,
      CONF.commonProps.court.northWest.postCode,
      CONF.commonProps.court.northWest.email
    ].forEach(courtDetail => {
      it(`does not contain northWest contact detail: ${courtDetail}`, done => {
        testNonExistence(done, agent, underTest, courtDetail);
      });
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

    [
      CONF.commonProps.court.northWest.email,
      CONF.commonProps.court.northWest.phoneNumber
    ].forEach(courtDetail => {
      it(`does contain northWest contact detail: ${courtDetail}`, done => {
        testExistence(done, agent, underTest, courtDetail);
      });
    });

    [
      CONF.commonProps.court.westMidlands.divorceCentre,
      CONF.commonProps.court.westMidlands.poBox,
      CONF.commonProps.court.westMidlands.courtCity,
      CONF.commonProps.court.westMidlands.postCode,
      CONF.commonProps.court.westMidlands.email
    ].forEach(courtDetail => {
      it(`does not contain westMidlands contact detail: ${courtDetail}`, done => {
        testNonExistence(done, agent, underTest, courtDetail);
      });
    });

    [
      CONF.commonProps.court.eastMidlands.divorceCentre,
      CONF.commonProps.court.eastMidlands.poBox,
      CONF.commonProps.court.eastMidlands.courtCity,
      CONF.commonProps.court.eastMidlands.postCode,
      CONF.commonProps.court.eastMidlands.email
    ].forEach(courtDetail => {
      it(`does not contain eastMidlands contact detail: ${courtDetail}`, done => {
        testNonExistence(done, agent, underTest, courtDetail);
      });
    });

    [
      CONF.commonProps.court.southWest.divorceCentre,
      CONF.commonProps.court.southWest.poBox,
      CONF.commonProps.court.southWest.courtCity,
      CONF.commonProps.court.southWest.postCode,
      CONF.commonProps.court.southWest.email
    ].forEach(courtDetail => {
      it(`does not contain southWest contact detail: ${courtDetail}`, done => {
        testNonExistence(done, agent, underTest, courtDetail);
      });
    });
  });
});

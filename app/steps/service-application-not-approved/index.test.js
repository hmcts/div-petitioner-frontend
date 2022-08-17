const request = require('supertest');
const { testContent, testExistence, testCustom } = require('test/util/assertions');
const { getTemplateFileLabel } = require('test/util/helpers');
const { withSession } = require('test/util/setup');
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');
const server = require('app');
const { expect } = require('test/util/chai');
const CONF = require('config');

const mockServiceRefusalSession = require('test/fixtures/mockServiceRefusalSession');

const modulePath = 'app/steps/service-application-not-approved';

const content = require(`${modulePath}/content`);

const feeToResendApplication = '53';

let appInstance = {};
let agent = {};
let underTest = {};

let session = {};

const buildServiceRefusalSession = (extraData = {}) => {
  const oneSecond = 1000;
  return Object.assign({}, mockServiceRefusalSession, { expires: Date.now() + oneSecond }, extraData);
};

const multipleOccurringTypes = [
  {
    viewLabel: getTemplateFileLabel(content, 'deemedServiceRefused'),
    expectedCount: 2
  },
  {
    viewLabel: getTemplateFileLabel(content, 'generalOrder'),
    expectedCount: 2
  }
];

const getOccurrencesInPage = (response, expectedText) => {
  return response.text.match(new RegExp(expectedText, 'g')).length;
};

describe(modulePath, () => {
  beforeEach(() => {
    appInstance = server.init();
    agent = request.agent(appInstance.app);
    underTest = appInstance.steps.ServiceApplicationNotApproved;
  });

  afterEach(() => {
    session = {};
  });

  describe('Template Rendering', () => {
    const dataContent = {
      feeToResendApplication,
      feeToEnforce: '110'
    };

    describe('Deemed service template', () => {
      beforeEach(done => {
        session = buildServiceRefusalSession();
        withSession(done, agent, session);
      });

      afterEach(() => {
        session = {};
      });

      it('should render the content from the content file for deemed service', done => {
        const deemedDataContent = Object.assign(dataContent, { serviceName: 'deemed service' });
        const exclude = [
          'serviceRefusalInfo.bailiff',
          'serviceRefusalInfo.dispensed',
          'refusalDocumentInfo',
          'serviceApplicationLabel.bailiff',
          'serviceApplicationLabel.dispensed',
          'files.respondentAnswers',
          'files.coRespondentAnswers',
          'files.certificateOfEntitlement',
          'files.costsOrder',
          'files.dnAnswers',
          'files.clarificationDnRefusalOrder',
          'files.rejectionDnRefusalOrder',
          'files.deemedAsServedGranted',
          'files.dispenseWithServiceGranted',
          'files.dispenseWithServiceRefused'
        ];
        testContent(done, agent, underTest, content, session, exclude, deemedDataContent, true);
      });

      it('should have \'deemedServiceRefused\' label in template view', done => {
        const deemedServiceRefusedFileLabel = getTemplateFileLabel(content, 'deemedServiceRefused');
        testExistence(done, agent, underTest, deemedServiceRefusedFileLabel);
      });

      multipleOccurringTypes.forEach(item => {
        // eslint-disable-next-line max-nested-callbacks
        it(`should have two '${item.viewLabel} (PDF)' labels in template view`, done => {
          // eslint-disable-next-line max-nested-callbacks
          testCustom(done, agent, underTest, [], response => {
            expect(getOccurrencesInPage(response, `${item.viewLabel} (PDF)`)).to.equal(item.expectedCount);
          });
        });
      });
    });

    describe('Dispense with service template', () => {
      beforeEach(done => {
        session = buildServiceRefusalSession({ serviceApplicationType: 'dispensed', d8: [] });
        session.d8 = [
          {
            id: '27387e86-7fb8-4b72-8786-64ea22cb746d',
            createdBy: 0,
            createdOn: null,
            lastModifiedBy: 0,
            modifiedOn: null,
            fileName: 'dispenseWithServiceRefused.pdf',
            fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/27387e86-7fb8-4b72-8786-64ea22cb746d',
            mimeType: null,
            status: null
          },
          {
            id: '27387e86-7fb8-4b72-8786-64ea22cb746d',
            createdBy: 0,
            createdOn: null,
            lastModifiedBy: 0,
            modifiedOn: null,
            fileName: 'generalOrder2020-09-09.pdf',
            fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/27387e86-7fb8-4b72-8786-64ea22cb746d',
            mimeType: null,
            status: null
          }
        ];
        withSession(done, agent, session);
      });

      afterEach(() => {
        session = {};
      });

      it('should render the content from the content file for dispense with service', done => {
        const dispenseDataContent = Object.assign(dataContent, { serviceName: 'dispense with service' });
        const exclude = [
          'serviceRefusalInfo.bailiff',
          'serviceRefusalInfo.deemed',
          'refusalDocumentInfo',
          'serviceApplicationLabel.bailiff',
          'serviceApplicationLabel.deemed',
          'files.respondentAnswers',
          'files.coRespondentAnswers',
          'files.certificateOfEntitlement',
          'files.costsOrder',
          'files.dnAnswers',
          'files.clarificationDnRefusalOrder',
          'files.rejectionDnRefusalOrder',
          'files.deemedAsServedGranted',
          'files.dispenseWithServiceGranted',
          'files.deemedServiceRefused'
        ];
        testContent(done, agent, underTest, content, session, exclude, dispenseDataContent, true);
      });

      it('should have one \'dispenseWithServiceRefused\' label in template view', done => {
        const dispenseWithServiceRefusedFileLabel = getTemplateFileLabel(content, 'dispenseWithServiceRefused');
        testExistence(done, agent, underTest, dispenseWithServiceRefusedFileLabel);
      });

      it('should have one \'generalOrder\' label in template view', done => {
        const generalFileLabel = getTemplateFileLabel(content, 'generalOrder');
        testExistence(done, agent, underTest, generalFileLabel);
      });
    });

    describe('Bailiff template', () => {
      beforeEach(done => {
        session = buildServiceRefusalSession({ serviceApplicationType: 'bailiff', d8: [] });
        session.d8 = [
          {
            id: '27387e86-7fb8-4b72-8786-64ea22cb746d',
            createdBy: 0,
            createdOn: null,
            lastModifiedBy: 0,
            modifiedOn: null,
            fileName: 'generalOrder2020-09-09.pdf',
            fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/27387e86-7fb8-4b72-8786-64ea22cb746d',
            mimeType: null,
            status: null
          }
        ];
        withSession(done, agent, session);
      });

      afterEach(() => {
        session = {};
      });

      it('should render the content from the content file for bailiff service', done => {
        const dispenseDataContent = Object.assign(dataContent, { serviceName: 'court bailiff service' });
        const exclude = [
          'serviceRefusalInfo.deemed',
          'serviceRefusalInfo.dispensed',
          'refusalDocumentInfo',
          'serviceApplicationLabel.deemed',
          'serviceApplicationLabel.dispensed',
          'files.respondentAnswers',
          'files.coRespondentAnswers',
          'files.certificateOfEntitlement',
          'files.costsOrder',
          'files.dnAnswers',
          'files.clarificationDnRefusalOrder',
          'files.rejectionDnRefusalOrder',
          'files.deemedAsServedGranted',
          'files.dispenseWithServiceGranted',
          'files.deemedServiceRefused',
          'files.dispenseWithServiceRefused'
        ];
        testContent(done, agent, underTest, content, session, exclude, dispenseDataContent, true);
      });

      it('should have one \'generalOrder\' label in template view', done => {
        const generalFileLabel = getTemplateFileLabel(content, 'generalOrder');
        testExistence(done, agent, underTest, generalFileLabel);
      });
    });
  });

  describe('Document Rendering', () => {
    beforeEach(done => {
      session = buildServiceRefusalSession();
      withSession(done, agent, session);
    });

    afterEach(() => {
      session = {};
    });

    it('should return the correct list of files', () => {
      session.d8.push({
        id: '401ab79e-34cb-4570-9f2f-4cf9357m4st3r',
        createdBy: 0,
        createdOn: null,
        lastModifiedBy: 0,
        modifiedOn: null,
        fileName: 'documentNotWhiteListed1554740111371638.pdf',
        fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/30acaa2f-84d7-4e27-adb3-69551560113f',
        mimeType: null,
        status: null
      });
      const expectedDocumentsSize = 6;
      const fileTypes = underTest.getDownloadableFiles(session).map(file => {
        return file.type;
      });

      expect(fileTypes).to.have.lengthOf(expectedDocumentsSize);
      expect(fileTypes).to.include('dpetition');
      expect(fileTypes).to.include('deemedServiceRefused');
      expect(fileTypes).to.include('generalOrder');
    });
  });

  describe('Allocated court info', () => {
    let allocatedCourt = {};

    beforeEach(done => {
      session = buildServiceRefusalSession();
      allocatedCourt = session.court.serviceCentre;
      withSession(done, agent, session);
    });

    afterEach(() => {
      session = {};
    });

    it('should contain allocated court e-mail once', done => {
      testCustom(done, agent, underTest, [], response => {
        const timesEmailShouldAppearOnPage = 2;
        const emailOccurrencesInPage = response.text.match(new RegExp(allocatedCourt.email, 'g')).length;
        expect(emailOccurrencesInPage).to.equal(timesEmailShouldAppearOnPage);
      });
    });

    it('should contain CTSC phone number', done => {
      testExistence(done, agent, underTest, CONF.commonProps.courtPhoneNumberEn);
    });

    it('should contain CTSC opening hours', done => {
      testExistence(done, agent, underTest, CONF.commonProps.courtOpeningHourEn);
    });
  });

  describe('Fees middleware', () => {
    it('should have updateEnforcementFeeMiddleware middleware loaded', () => {
      expect(underTest.middleware
        .includes(applicationFeeMiddleware.updateEnforcementFeeMiddleware))
        .to.eql(true);
    });

    it('should have updateAppWithoutNoticeFeeFeeMiddleware middleware loaded', () => {
      expect(underTest.middleware
        .includes(applicationFeeMiddleware.updateAppWithoutNoticeFeeMiddleware))
        .to.eql(true);
    });
  });

  describe('ServiceApplicationNotApproved', () => {
    describe('Refusal documents', () => {
      beforeEach(done => {
        session = buildServiceRefusalSession();
        withSession(done, agent, session);
      });

      afterEach(() => {
        session = {};
      });

      it('should return correct list of documents', () => {
        const expectedListSize = 6;
        const downloadableFiles = underTest.getDownloadableFiles(session);

        expect(downloadableFiles).to.have.lengthOf(expectedListSize);
        expect(downloadableFiles[0]).to.have.all.keys('uri', 'type', 'fileType');
      });

      it('should return correct service refusal label for deemed', () => {
        const fileLabel = underTest.getRefusalDocumentLabel(session);
        expect(fileLabel).to.eq('Deemed service refusal');
      });

      it('should return correct service refusal document for dispense with service', () => {
        session.serviceApplicationType = 'dispensed';
        session.d8 = [
          {
            id: '27387e86-7fb8-4b72-8786-64ea22cb746d',
            createdBy: 0,
            createdOn: null,
            lastModifiedBy: 0,
            modifiedOn: null,
            fileName: 'dispenseWithServiceRefused.pdf',
            fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/27387e86-7fb8-4b72-8786-64ea22cb746d',
            mimeType: null,
            status: null
          }, {
            id: '27387e86-7fb8-4b72-8786-64ea22cb746d',
            createdBy: 0,
            createdOn: null,
            lastModifiedBy: 0,
            modifiedOn: null,
            fileName: 'd8petition1594218147343642.pdf',
            fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/27387e86-7fb8-4b72-8786-64ea22cb7463',
            mimeType: null,
            status: null
          }
        ];
        session.downloadableFiles = underTest.getDownloadableFiles(session);
        const fileLabel = underTest.getRefusalDocumentLabel(session);

        expect(fileLabel).to.eq('Dispensed service refusal');
      });
    });
  });
});

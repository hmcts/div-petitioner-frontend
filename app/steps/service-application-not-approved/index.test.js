const request = require('supertest');
const { testExistence, testCustom, testContentWithHTMLEntities } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');
const server = require('app');
const { expect, sinon } = require('test/util/chai');
const mockServiceRefusalSession = require('test/fixtures/mockServiceRefusalSession');

const modulePath = 'app/steps/service-application-not-approved';

const content = require(`${modulePath}/content`);

let appInstance = {};
let agent = {};
let underTest = {};

let session = {};

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
    let deemedDataContent = {};
    let dispenseDataContent = {};
    const dataContent = {
      feeToResendApplication: '50',
      feeToEnforce: '110'
    };

    describe('Deemed service template', () => {
      beforeEach(done => {
        deemedDataContent = Object.assign(dataContent, { mainHeading: 'deemed service', serviceName: 'deemed service' });
        session = Object.assign({}, mockServiceRefusalSession);
        withSession(done, agent, session);
      });

      afterEach(() => {
        session = {};
      });

      it('should render the content from the content file for deemed service', done => {
        const exclude = [
          'serviceRefusalInfo.dispensed',
          'refusalDocumentInfo',
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
          'files.DispenseWithServiceRefused'
        ];
        testContentWithHTMLEntities(done, agent, underTest, content, session, exclude, deemedDataContent);
      });
    });

    describe('Dispense with service template', () => {
      beforeEach(done => {
        dispenseDataContent = Object.assign(dataContent, { mainHeading: 'dispense with service', serviceName: 'dispense with service' });
        session = Object.assign({}, mockServiceRefusalSession, { serviceApplicationType: 'dispensed', d8: [] });
        session.d8 = [
          {
            id: '27387e86-7fb8-4b72-8786-64ea22cb746d',
            createdBy: 0,
            createdOn: null,
            lastModifiedBy: 0,
            modifiedOn: null,
            fileName: 'DispenseWithServiceRefused.pdf',
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
        const exclude = [
          'serviceRefusalInfo.deemed',
          'refusalDocumentInfo',
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
          'files.DeemedServiceRefused'
        ];
        testContentWithHTMLEntities(done, agent, underTest, content, session, exclude, dispenseDataContent);
      });
    });
  });

  describe('Document rendering', () => {
    beforeEach(done => {
      const oneSecond = 1000;
      session = Object.assign({}, mockServiceRefusalSession);
      session.expires = Date.now() + oneSecond;
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
      const expectedDocumentsSize = 3;
      const fileTypes = underTest.getDownloadableFiles(session).map(file => {
        return file.type;
      });

      expect(fileTypes).to.have.lengthOf(expectedDocumentsSize);
      expect(fileTypes).to.include('dpetition');
      expect(fileTypes).to.include('DeemedServiceRefused');
    });
  });

  describe('Allocated court info', () => {
    let allocatedCourt = {};

    beforeEach(done => {
      session = Object.assign({}, mockServiceRefusalSession);
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

    it('should contain allocated court phone number', done => {
      testExistence(done, agent, underTest, allocatedCourt.phoneNumber);
    });

    it('should contain allocated court opening hours', done => {
      testExistence(done, agent, underTest, allocatedCourt.openingHours);
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
    describe('#getServiceRefusalDocument', () => {
      let getCurrentContentStub = null;
      beforeEach(done => {
        getCurrentContentStub = sinon.stub(underTest, 'getCurrentContent')
          .returns(content.resources[mockServiceRefusalSession.language].translation.content);

        session = Object.assign({}, mockServiceRefusalSession);
        withSession(done, agent, session);
      });

      afterEach(() => {
        session = {};
        getCurrentContentStub.restore();
      });

      it('should return correct list of documents', () => {
        const expectedListSize = 3;
        const downloadableFiles = underTest.getDownloadableFiles(session);

        expect(downloadableFiles).to.have.lengthOf(expectedListSize);
        expect(downloadableFiles[0]).to.have.all.keys('uri', 'type', 'fileType');
      });

      it('should return correct service refusal document for deemed', () => {
        session.downloadableFiles = underTest.getDownloadableFiles(session);
        const { fileLabel, fileUri } = underTest.getServiceRefusalDocument(session);

        expect(fileLabel).to.eq('Deemed service refusal');
        expect(fileUri).to.have.string('DeemedServiceRefused1594218147343643.pdf');
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
            fileName: 'DispenseWithServiceRefused.pdf',
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
        const { fileLabel, fileUri } = underTest.getServiceRefusalDocument(session);

        expect(fileLabel).to.eq('Dispensed service refusal');
        expect(fileUri).to.have.string('DispenseWithServiceRefused.pdf');
      });

      it('should return empty string if no refusal document found', () => {
        const noDocumentSession = { downloadableFiles: [], serviceApplicationType: 'deemed', language: 'en' };
        const document = underTest.getServiceRefusalDocument(noDocumentSession);
        // eslint-disable-next-line no-unused-expressions
        expect(document).to.be.undefined;
      });
    });
  });
});

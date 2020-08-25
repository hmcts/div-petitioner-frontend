const request = require('supertest');
const { testContent, testExistence, testCustom } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');
const server = require('app');
const { expect } = require('test/util/chai');
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
    beforeEach(done => {
      session = Object.assign({}, mockServiceRefusalSession, {
        feeToResendApplication: '50',
        refusalDocument: 'doc',
        refusalDocumentUrl: 'http://url.co',
        feeToEnforce: '110',
        serviceApplicationTypeLabel: 'label'
      });
      withSession(done, agent, session);
    });

    afterEach(() => {
      session = {};
    });

    it('should render the content from the content file', done => {
      const exclude = [
        'mainHeading',
        'serviceRefusalInfo',
        'warning',
        'believeRespChoseNotToRespond.courtBailiffDetails2',
        'yourCourt',
        'openTimes',
        'solicitorLink',
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
      testContent(done, agent, underTest, content, session, exclude);
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
        // eslint-disable-next-line max-len
        fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/30acaa2f-84d7-4e27-adb3-69551560113f',
        mimeType: null,
        status: null
      });
      const expectedDocumentsSize = 2;
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

  describe('SaNotApproved', () => {
    describe('#getServiceApplicationTypeLabel', () => {
      const labels = {
        deemed: '\'deemed service\'',
        dispensed: '\'dispensed with service\''
      };
      it('should return deemed service label', () => {
        session = { serviceApplicationType: 'deemed' };
        expect(underTest.getServiceApplicationTypeLabel(session)).to.eq(labels.deemed);
      });
      it('should return dispensed service label', () => {
        session = { serviceApplicationType: 'dispensed' };
        expect(underTest.getServiceApplicationTypeLabel(session)).to.eq(labels.dispensed);
      });
    });

    describe('#getServiceRefusalDocument', () => {
      beforeEach(done => {
        session = Object.assign({}, mockServiceRefusalSession);
        withSession(done, agent, session);
      });

      afterEach(() => {
        session = {};
      });

      it('should return correct list of documents', () => {
        const expectedListSize = 2;
        const downloadableFiles = underTest.getDownloadableFiles(session);

        expect(downloadableFiles).to.have.lengthOf(expectedListSize);
        expect(downloadableFiles[0]).to.have.all.keys('uri', 'type', 'fileType');
      });

      it('should return correct service refusal document for deemed', () => {
        session.downloadableFiles = underTest.getDownloadableFiles(session);
        const { type, uri } = underTest.getServiceRefusalDocument(session);

        expect(type).to.eq('DeemedServiceRefused');
        expect(uri).to.have.string('DeemedServiceRefused.pdf');
      });

      it('should return empty string if no refusal document found', () => {
        const noDocumentSession = Object.assign(session);
        noDocumentSession.d8 = [];
        noDocumentSession.downloadableFiles = underTest.getDownloadableFiles(noDocumentSession);

        const { type, uri } = underTest.getServiceRefusalDocument(noDocumentSession);
        expect(type).to.eql('');
        expect(uri).to.eql('');
      });
    });
  });
});

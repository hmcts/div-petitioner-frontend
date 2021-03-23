const request = require('supertest');
const { testContent, testExistence } = require('test/util/assertions');
const { getTemplateFileLabel } = require('test/util/helpers');
const mockIssuedToBailiffSession = require('test/fixtures/mockIssuedToBailiffSession');
const { withSession } = require('test/util/setup');
const { expect } = require('test/util/chai');
const appServer = require('app');

const modulePath = 'app/steps/issued-to-bailiff';

const content = require(`${modulePath}/content`);

let appInstance = {};
let agent = {};
let underTest = {};
let session = {};

const buildSession = () => {
  const oneSecond = 1000;
  return Object.assign({}, mockIssuedToBailiffSession, { expires: Date.now() + oneSecond });
};

const downloadFiles = [
  'downloadDocumentsHeading',
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
  'files.dispenseWithServiceRefused',
  'files.generalOrder'
];

const interpolationTextFields = [
  'yourResponds',
  'issuedToBailiffInfoPara3',
  'issuedToBailiffInfoPara4',
  'howToRespondLink'
];

describe(`Template rendering: ${modulePath}`, () => {
  beforeEach(done => {
    appInstance = appServer.init();
    agent = request.agent(appInstance.app);
    underTest = appInstance.steps.SentToBailiff;
    session = buildSession();
    withSession(done, agent, session);
  });

  afterEach(() => {
    session = {};
  });

  describe('Issued To Bailiff: Template rendering', () => {
    const exclude = downloadFiles.concat(interpolationTextFields);

    it('should render the content from the content file when state is IssuedToBailiff', done => {
      testContent(done, agent, underTest, content, appInstance, exclude);
    });

    it('should render court bailiff served text to respondent party gender', done => {
      testExistence(done, agent, underTest,
        'If the court bailiff is able to serve successfully, then your wife is given 7 days to respond.');
    });

    it('should have one \'dpetition\' label in template view', done => {
      const dpetitionFileLabel = getTemplateFileLabel(content, 'dpetition');
      testExistence(done, agent, underTest, dpetitionFileLabel);
    });

    it('should have one \'General Order\' label in template view', done => {
      const generalOrderFileLabel = getTemplateFileLabel(content, 'generalOrder');
      testExistence(done, agent, underTest, generalOrderFileLabel);
    });
  });

  describe('Issued To Bailiff: Document Rendering', () => {
    beforeEach(done => {
      session = buildSession();
      withSession(done, agent, session);
    });

    it('should return the correct list of files: dpetition and generalOrder', () => {
      const expectedDocumentsSize = 2;
      const fileTypes = underTest.getDownloadableFiles(session).map(file => {
        return file.type;
      });

      expect(fileTypes).to.have.lengthOf(expectedDocumentsSize);
      expect(fileTypes).to.include('dpetition');
      expect(fileTypes).to.include('generalOrder');
    });

    it('should return only one file', () => {
      const expectedDocumentsSize = 1;
      session.d8 = [
        {
          id: '0ecc2507-1acf-46ae-b0d8-2d7c032fc145',
          createdBy: 0,
          createdOn: null,
          lastModifiedBy: 0,
          modifiedOn: null,
          fileName: 'd8petition1594218147343642.pdf',
          fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/0ecc2507-1acf-46ae-b0d8-2d7c032fc145',
          mimeType: null,
          status: null
        }
      ];
      const fileTypes = underTest.getDownloadableFiles(session).map(file => {
        return file.type;
      });

      expect(fileTypes).to.have.lengthOf(expectedDocumentsSize);
      expect(fileTypes).to.include('dpetition');
    });
  });
});

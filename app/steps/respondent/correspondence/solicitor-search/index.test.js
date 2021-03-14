/* eslint no-unused-expressions: "off" */
const request = require('supertest');
const {
  testRedirect,
  testContent
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/respondent/correspondence/solicitor-search';
const content = require(`${modulePath}/content`);

let appInstance = {};
let agent = {};
let underTest = {};

const TEST_RESP_SOLICITOR_NAME = 'RespondentSolicitor';
const TEST_RESP_SOLICITOR_EMAIL = 'test@email';
const TEST_RESP_SOLICITOR_REF = 'SOL-REF';
const TEST_RESP_SOLICITOR_COMPANY = 'Whitehead & Low Solicitors LLP';
const TEST_RESP_SOLICITOR_ID = '11-111';

function buildRespondentSolicitorSessionData() {
  return {
    divorceWho: 'wife',
    respondentSolicitorName: TEST_RESP_SOLICITOR_NAME,
    respondentSolicitorEmail: TEST_RESP_SOLICITOR_EMAIL,
    respondentSolicitorReference: TEST_RESP_SOLICITOR_REF,
    respondentSolicitorOrganisation: {
      contactInformation: [
        {
          addressLine1: '19/22 Union St',
          addressLine2: 'Oldham',
          addressLine3: '',
          country: 'United Kingdom',
          county: 'Greater Manchester',
          postCode: 'OL1 222',
          townCity: 'Manchester'
        }
      ],
      name: TEST_RESP_SOLICITOR_COMPANY,
      organisationIdentifier: TEST_RESP_SOLICITOR_ID
    },
    respondentSolicitorFirm: 'searchCriteria'
  };
}

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    appInstance = server.init();
    agent = request.agent(appInstance.app);
    underTest = appInstance.steps.RespondentCorrespondenceSolicitorSearch;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('Solicitor Search', () => {
    const session = buildRespondentSolicitorSessionData();

    beforeEach(done => {
      withSession(done, agent, session);
    });

    describe('View content rendering', () => {
      it('renders the content from the content file', done => {
        const excludedKeys = [
          'deselectBtnText',
          'selectBtnText',
          'enterManuallyBtnText',
          'resultsLabel',
          'solicitorNameLabel',
          'solicitorReferenceLabel',
          'searchSolicitorFirm',
          'solicitorEmailLabel',
          'errorSummaryHeading',
          'solicitorFirmAddressLabel',
          'searchNoOptionFoundText',
          'searchNoResults.paragraph1',
          'searchNoResults.paragraph2',
          'searchNoResults.paragraph3',
          'searchErrors.emptyValue',
          'searchErrors.shortValue',
          'searchErrors.solicitorName',
          'searchErrors.solicitorEmail'
        ];

        testContent(done, agent, underTest, content, session, excludedKeys);
      });
    });

    describe('User action redirection', () => {
      it('should not redirect when user action is SELECTION', done => {
        testRedirect(done, agent, underTest, { userAction: 'selection' }, appInstance.steps.RespondentCorrespondenceSolicitorSearch);
      });

      it('should not redirect when user action is SEARCH', done => {
        testRedirect(done, agent, underTest, { userAction: 'search' }, appInstance.steps.RespondentCorrespondenceSolicitorSearch);
      });

      it('should not redirect when user action is PROVIDED and required data not provided', done => {
        testRedirect(done, agent, underTest, { userAction: 'provided' }, appInstance.steps.RespondentCorrespondenceSolicitorSearch);
      });
    });
  });
});

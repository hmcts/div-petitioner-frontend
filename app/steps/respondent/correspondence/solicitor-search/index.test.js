/* eslint no-unused-expressions: "off" */
const request = require('supertest');
const {
  testRedirect,
  testContent
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { expect } = require('test/util/chai');

const modulePath = 'app/steps/respondent/correspondence/solicitor-search';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

const TEST_RESP_SOLICITOR_NAME = 'RespondentSolicitor';
const TEST_RESP_SOLICITOR_REF = 'SOL-REF';
const TEST_RESP_SOLICITOR_COMPANY = 'Whitehead & Low Solicitors LLP';
const TEST_RESP_SOLICITOR_ID = '11-111';

function buildRespondentSolicitorSessionData() {
  return {
    divorceWho: 'wife',
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
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.RespondentCorrespondenceSolicitorSearch;
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
          'solicitorEmailLabel',
          'solicitorFirmAddressLabel',
          'searchNoOptionFoundText',
          'searchNoResults.paragraph1',
          'searchNoResults.paragraph2',
          'searchNoResults.paragraph3',
          'searchErrors.emptyValue',
          'searchErrors.shortValue',
          'searchErrors.solicitorName'
        ];

        testContent(done, agent, underTest, content, session, excludedKeys);
      });
    });

    describe('User action redirection', () => {
      it('should redirect to reason for divorce page when user action is not handled', done => {
        testRedirect(done, agent, underTest, {}, s.steps.ReasonForDivorce);
      });

      it('should redirect to solicitor details manual page when user action is MANUAL', done => {
        testRedirect(done, agent, underTest, { userAction: 'manual' }, s.steps.RespondentSolicitorSearchManual);
      });

      it('should not redirect when user action is SELECTION', done => {
        testRedirect(done, agent, underTest, { userAction: 'selection' }, s.steps.RespondentCorrespondenceSolicitorSearch);
      });

      it('should not redirect when user action is SEARCH', done => {
        testRedirect(done, agent, underTest, { userAction: 'search' }, s.steps.RespondentCorrespondenceSolicitorSearch);
      });

      it('should not redirect when user action is PROVIDED and required data not provided', done => {
        testRedirect(done, agent, underTest, { userAction: 'provided' }, s.steps.RespondentCorrespondenceSolicitorSearch);
      });

      it('should redirect when user action is PROVIDED and data is provided', done => {
        testRedirect(done, agent, underTest, {
          userAction: 'provided',
          respondentSolicitorName: 'testSolicitorName'
        }, s.steps.ReasonForDivorce);
      });
    });
  });

  describe('Solicitor search functionality', () => {
    let req = {};
    const session = buildRespondentSolicitorSessionData();

    beforeEach(() => {
      req = { session };
    });

    it('should map current data to expected respondent solicitor payload', () => {
      const expectedAddress = [
        '19/22 Union St',
        'Oldham',
        'United Kingdom',
        'Greater Manchester',
        'OL1 222',
        'Manchester'
      ];
      req.body = {
        respondentSolicitorName: TEST_RESP_SOLICITOR_NAME,
        respondentSolicitorReference: TEST_RESP_SOLICITOR_REF
      };

      underTest.mapRespondentSolicitorData(req);

      expect(req.session.respondentSolicitorName).to.equal(TEST_RESP_SOLICITOR_NAME);
      expect(req.session.respondentSolicitorReference).to.equal(TEST_RESP_SOLICITOR_REF);
      expect(req.session).to.not.have.property('respondentSolicitorEmail');
      expect(req.session.respondentSolicitorCompany).to.equal(TEST_RESP_SOLICITOR_COMPANY);
      expect(req.session.respondentSolicitorAddress).to.have.property('address');
      expect(req.session.respondentSolicitorAddress.address).to.have.deep.members(expectedAddress);
      expect(req.session.respondentSolicitorReferenceDataId).to.equal(TEST_RESP_SOLICITOR_ID);
    });

    it('should map empty array to solicitor address when no solicitor organisation', () => {
      req.session.respondentSolicitorOrganisation = null;

      underTest.mapRespondentSolicitorData(req);

      expect(req.session.respondentSolicitorName).to.be.undefined;
      expect(req.session.respondentSolicitorReference).to.be.undefined;
      expect(req.session).to.not.have.property('respondentSolicitorEmail');
      expect(req.session.respondentSolicitorCompany).to.be.undefined;
      expect(req.session.respondentSolicitorAddress).to.have.property('address');
      expect(req.session.respondentSolicitorAddress.address).to.have.lengthOf(0);
      expect(req.session.respondentSolicitorReferenceDataId).to.be.undefined;
    });
  });
});

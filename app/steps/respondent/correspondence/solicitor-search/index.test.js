/* eslint no-unused-expressions: "off" */
/* eslint  max-nested-callbacks: "off" */
const request = require('supertest');
const {
  testContent,
  testExistence,
  testMultipleValuesExistence,
  testCustom,
  testExistenceCYA,
  testCYATemplate
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { expect, sinon } = require('test/util/chai');
const { escape } = require('lodash');

const searchHelper = require('app/core/utils/respondentSolicitorSearchHelper');

const modulePath = 'app/steps/respondent/correspondence/solicitor-search';
const content = require(`${modulePath}/content`);


const contentStrings = content.resources.en.translation.content;
const { UserAction } = searchHelper;
const TEST_RESP_SOLICITOR_NAME = 'RespondentSolicitor';
const TEST_RESP_SOLICITOR_EMAIL = 'test@email';
const TEST_RESP_SOLICITOR_REF = 'SOL-REF';
const TEST_RESP_SOLICITOR_COMPANY = 'Whitehead & Low Solicitors LLP';
const TEST_RESP_SOLICITOR_ID = '11-111';

let appInstance = {};
let agent = {};
let underTest = {};
let session = {};

function buildResultData() {
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

function buildMockOrganisationsList() {
  return [
    {
      contactInformation: [
        {
          addressLine1: '1 Trasna way',
          addressLine2: 'Lurgan',
          addressLine3: '',
          country: 'United Kingdom',
          county: 'Armagh',
          postCode: 'BT25 545',
          townCity: 'Craigavon'
        }
      ],
      name: 'Campbell & Haughey Solicitors Ltd',
      organisationIdentifier: '02-002'
    },
    {
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
    }
  ];
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
    session = {};
  });

  describe('Solicitor Search', () => {
    context('Template Rendering:', () => {
      session = { divorceWho: 'wife' };

      beforeEach(done => {
        withSession(done, agent, session);
      });

      afterEach(() => {
        session = {};
      });

      describe('Landing page view:', () => {
        it('should display correct search label', done => {
          testExistence(done, agent, underTest, contentStrings.solicitorFirmLabel);
        });

        it('should display correct search label', done => {
          testExistence(done, agent, underTest, contentStrings.searchButton);
        });

        it('contains references to wife', done => {
          const excludedKeys = [
            'deselectBtnText',
            'selectBtnText',
            'enterManuallyBtnText',
            'resultsLabel',
            'question',
            'solicitorNameLabel',
            'solicitorEmailManualLabel',
            'solicitorReferenceLabel',
            'searchSolicitorFirm',
            'solicitorEmailLabel',
            'solicitorEmailManualLabel',
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
          testContent(done, agent, underTest, content, session, excludedKeys, { divorceWho: 'wife' }, false);
        });

        it('#ignorePa11yErrors returns an array', () => {
          const totalIgnored = 1;
          expect(underTest.ignorePa11yErrors).to.be.lengthOf(totalIgnored);
        });
      });

      describe('Search view when no results:', () => {
        beforeEach(done => {
          session = { divorceWho: 'wife', organisations: [], respondentSolicitorFirm: 'test' };
          withSession(done, agent, session);
        });

        it('should display correct no search no result paragraph', done => {
          testMultipleValuesExistence(done, agent, underTest,
            [
              contentStrings.searchNoResults.paragraph1,
              contentStrings.searchNoResults.paragraph2,
              contentStrings.searchNoResults.paragraph3
            ], {});
        });

        it('should display the enter manually text button', done => {
          testExistence(done, agent, underTest, contentStrings.enterManuallyBtnText);
        });
      });

      describe('Search view when result found and selected', () => {
        beforeEach(done => {
          session = buildResultData();
          session.organisations = buildMockOrganisationsList();
          withSession(done, agent, session);
        });

        it('should display solicitor organisation details', done => {
          testCustom(done, agent, underTest, [], response => {
            expect(response.text.includes(escape('Whitehead & Low Solicitors LLP'))).to.equal(true);
            expect(response.text.includes(escape('19/22 Union St'))).to.equal(true);
            expect(response.text.includes(escape('Oldham'))).to.equal(true);
            expect(response.text.includes(escape('Greater Manchester'))).to.equal(true);
            expect(response.text.includes(escape('OL1 222'))).to.equal(true);
            expect(response.text.includes(escape('Manchester'))).to.equal(true);
            expect(response.text.includes(escape('United Kingdom'))).to.equal(true);
          });
        });

        it('should display respondentSolicitorName input', done => {
          testExistence(done, agent, underTest, contentStrings.solicitorNameLabel);
        });

        it('should display respondentSolicitorEmail input', done => {
          testExistence(done, agent, underTest, contentStrings.solicitorEmailLabel);
        });

        it('should display respondentSolicitorReference input', done => {
          testExistence(done, agent, underTest, contentStrings.solicitorReferenceLabel);
        });

        it('should display submit button input', done => {
          testExistence(done, agent, underTest, content.continueBtnText);
        });
      });

      describe('Search view when result found and listed', () => {
        const getOccurrencesInPage = (response, expectedText) => {
          return response.text.match(new RegExp(escape(expectedText), 'g')).length;
        };

        beforeEach(done => {
          session = buildResultData();
          session.organisations = buildMockOrganisationsList();
          session.respondentSolicitorOrganisation = null;
          withSession(done, agent, session);
        });

        it('should list of organisation details', done => {
          const organisationCount = 2;

          testCustom(done, agent, underTest, [], response => {
            expect(response.text.includes(escape('Whitehead & Low Solicitors LLP'))).to.equal(true);
            expect(response.text.includes(escape('Campbell & Haughey Solicitors Ltd'))).to.equal(true);
            expect(getOccurrencesInPage(response, 'select-')).to.equal(organisationCount);
            expect(response.text.includes(contentStrings.enterManuallyBtnText)).to.equal(true);
          });
        });
      });

      describe('Check Your Answers page', () => {
        session = {
          divorceWho: 'wife',
          respondentSolicitorName: 'Solicitor name',
          respondentSolicitorAddress: {
            address: ['line 1', 'line 2', 'line 3', 'postcode']
          }
        };

        beforeEach(done => {
          withSession(done, agent, session);
        });

        afterEach(() => {
          session = {};
        });

        it('renders the cya template', done => {
          testCYATemplate(done, underTest, {}, session);
        });

        it('renders address', done => {
          testExistenceCYA(done, underTest, content, [], [], {}, {
            divorceWho: 'wife',
            respondentSolicitorName: 'Solicitor name',
            respondentSolicitorAddress: {
              address: ['line 1', 'line 2', 'line 3', 'postcode']
            }
          });
        });
      });
    });

    context('UserAction functionality', () => {
      let req = {};
      let res = {};
      let postBody = {};
      let resetManualRespondentSolicitorData = null;
      let resetRespondentSolicitorData = null;

      describe('#validate', () => {
        it('should return as valid when default validation is called', () => {
          expect(underTest.validate({}, session))
            .to.deep.equal([true, null]);
        });
      });

      describe('#handler', () => {
        beforeEach(() => {
          req = {
            body: {},
            method: 'POST',
            session: {},
            cookies: { '__auth-token': 'fake.token' },
            headers: {}
          };
          res = {
            redirect: sinon.stub(),
            sendStatus: sinon.stub()
          };

          resetManualRespondentSolicitorData = sinon.stub(searchHelper, 'resetManualRespondentSolicitorData');
          resetRespondentSolicitorData = sinon.stub(searchHelper, 'resetRespondentSolicitorData');
        });

        afterEach(() => {
          req = {};
          res = {};
          resetManualRespondentSolicitorData.restore();
          resetRespondentSolicitorData.restore();
        });

        it('should not redirect when submitted without submit button', done => {
          postBody = {};
          testCustom(done, agent, underTest, [], response => {
            expect(response.res.headers.location).to.equal(underTest.url);
          }, 'post', true, postBody);
        });

        it('should redirect to manual url when UserAction is \'MANUAL\'', async () => {
          req.body = {
            userAction: UserAction.MANUAL
          };

          await underTest.handler(req, res);

          expect(res.redirect.called).to.eql(true);
          expect(res.redirect.calledWith(`${underTest.url}/manual`)).to.equal(true);
          expect(resetManualRespondentSolicitorData.calledOnce).to.equal(true);
        });

        it('should set solicitor organisation when UserAction is \'SELECTION\'', async () => {
          req.session.organisations = buildMockOrganisationsList();
          req.body = {
            userAction: UserAction.SELECTION,
            userSelection: '02-002'
          };

          await underTest.handler(req, res);

          expect(res.redirect.calledWith(underTest.url)).to.equal(true);
          expect(req.session.respondentSolicitorOrganisation).not.to.be.undefined;
          expect(resetRespondentSolicitorData.calledOnce).to.equal(true);
        });

        it('should reset respondent solicitor session data when UserAction is \'DESELECTION\'', async () => {
          resetRespondentSolicitorData.callThrough();

          const SOME_VALUE = 'SomeValue';
          req.session = {
            respondentSolicitorOrganisation: SOME_VALUE,
            respondentSolicitorName: SOME_VALUE
          };
          req.body = {
            userAction: UserAction.DESELECTION
          };

          await underTest.handler(req, res);

          expect(req.session.respondentSolicitorOrganisation).to.be.undefined;
          expect(req.session.respondentSolicitorName).to.be.undefined;
          expect(resetRespondentSolicitorData.calledOnce).to.equal(true);
        });
      });

      describe('#getRequest', () => {
        beforeEach(() => {
          req = {
            body: {},
            method: 'POST',
            session: {},
            cookies: { '__auth-token': 'fake.token' },
            headers: {},
            query: { searchType: 'manual' }
          };
          res = {
            redirect: sinon.stub(),
            sendStatus: sinon.stub()
          };
        });

        afterEach(() => {
          req = {};
          res = {};
        });

        it('should set the search type as manual', () => {
          underTest.getRequest(req, res);

          expect(req.session.searchType).to.equal('manual');
        });

        it('should not set the search type as manual', () => {
          req.query = {};

          underTest.getRequest(req, res);

          expect(req.session.searchType).to.be.undefined;
        });
      });
    });
  });
});

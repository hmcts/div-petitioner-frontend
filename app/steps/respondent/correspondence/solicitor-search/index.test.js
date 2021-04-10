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
const co = require('co');

const modulePath = 'app/steps/respondent/correspondence/solicitor-search';
const content = require(`${modulePath}/content`);

const contentStrings = content.resources.en.translation.content;

const { buildResultData, buildMockOrganisationsList } = require('test/util/petitionTestHelper');
const searchHelper = require('app/core/utils/respondentSolicitorSearchHelper');

const { UserAction } = searchHelper;

let appInstance = {};
let agent = {};
let underTest = {};
let session = {};

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
        beforeEach(done => {
          session = {
            divorceWho: 'wife',
            respondentSolicitorName: 'Solicitor name',
            respondentSolicitorEmail: 'email@email.com',
            respondentSolicitorAddress: {
              address: ['line 1', 'line 2', 'line 3']
            }
          };
          withSession(done, agent, session);
        });

        afterEach(() => {
          session = {};
        });

        it('should render the cya template', done => {
          testCYATemplate(done, underTest, {}, session);
        });

        it('should render expected CYA solicitor address and default change url', done => {
          const contentToExist = ['question'];
          const valuesToExist = [
            'divorceWho',
            'respondentSolicitorDisplayAddress'
          ];
          const context = {
            respondentSolicitorDisplayAddress: 'Solicitor name<br>line 1<br>line 2<br>line 3<br>email@email.com'
          };
          session = Object.assign(session, { respondentSolicitorReferenceDataId: 'refId' });

          testExistenceCYA(done, underTest, content, contentToExist, valuesToExist, context, session);
        });

        it('should render expected CYA solicitor address and manual change url', done => {
          const contentToExist = ['question'];
          const valuesToExist = [
            'divorceWho',
            'respondentSolicitorDisplayAddress',
            'respondentSolicitorDisplayUrl'
          ];
          const context = {
            respondentSolicitorDisplayAddress: 'Solicitor name<br>Solicitor company<br>line 1<br>line 2<br>line 3<br>email@email.com',
            respondentSolicitorDisplayUrl: `${underTest.url}/manual`
          };
          session = Object.assign(session, {
            searchType: 'manual',
            respondentSolicitorCompany: 'Solicitor company'
          });

          testExistenceCYA(done, underTest, content, contentToExist, valuesToExist, context, session);
        });
      });
    });

    context('UserAction functionality', () => {
      let req = {};
      let res = {};
      let postBody = {};

      describe('#validate', () => {
        it('should return as invalid with errors when validating no data', () => {
          const totalErrors = 5;
          const [isValid, errors] = underTest.validate({}, session);

          expect(isValid).to.be.false;
          expect(errors).to.have.lengthOf(totalErrors);
        });
      });

      describe('#handler', () => {
        let resetManualRespondentSolicitorData = null;
        let resetRespondentSolicitorData = null;
        let fetchAndAddOrganisations = null;
        let validateSearchRequest = null;
        let errorsCleanup = null;

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
          fetchAndAddOrganisations = sinon.stub(searchHelper, 'fetchAndAddOrganisations');
          validateSearchRequest = sinon.stub(searchHelper, 'validateSearchRequest');
          errorsCleanup = sinon.stub(searchHelper, 'errorsCleanup');
        });

        afterEach(() => {
          req = {};
          res = {};
          resetManualRespondentSolicitorData.restore();
          resetRespondentSolicitorData.restore();
          fetchAndAddOrganisations.restore();
          validateSearchRequest.restore();
          errorsCleanup.restore();
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

        it('should remain on same view when UserAction is \'SEARCH\' and search criteria is invalid', async () => {
          validateSearchRequest.returns([false, {}]);
          const TOO_SHORT = 'ab';
          req.body = {
            userAction: UserAction.SEARCH,
            respondentSolicitorFirm: TOO_SHORT
          };

          await underTest.handler(req, res);

          expect(res.redirect.calledWith(underTest.url)).to.equal(true);
          expect(fetchAndAddOrganisations.calledOnce).to.equal(false);
          expect(validateSearchRequest.calledOnce).to.equal(true);
        });

        it('should call fetchAndAddOrganisations when UserAction is \'SEARCH\' and search criteria is valid', async () => {
          validateSearchRequest.returns([true, {}]);
          const VALID_NAME = 'criteria';
          req.body = {
            userAction: UserAction.SEARCH,
            respondentSolicitorFirm: VALID_NAME
          };

          await underTest.handler(req, res);

          expect(res.redirect.calledWith(underTest.url)).to.equal(true);
          expect(errorsCleanup.calledOnce).to.equal(true);
          expect(fetchAndAddOrganisations.calledOnce).to.equal(true);
          expect(fetchAndAddOrganisations.calledWith(req, sinon.match(VALID_NAME))).to.equal(true);
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

      describe('#postRequest', () => {
        let isManual = null;
        let mapValidationErrors = null;
        let isInValidManualData = null;
        let isInValidSearchData = null;
        let mapRespondentSolicitorData = null;
        let validate = null;

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

          sinon.stub(underTest, 'parseCtx').resolves();
          validate = sinon.stub(underTest, 'validate');
          isManual = sinon.stub(searchHelper, 'isManual');
          mapValidationErrors = sinon.stub(searchHelper, 'mapValidationErrors');
          isInValidManualData = sinon.stub(searchHelper, 'isInValidManualData');
          isInValidSearchData = sinon.stub(searchHelper, 'isInValidSearchData');
          mapRespondentSolicitorData = sinon.stub(searchHelper, 'mapRespondentSolicitorData');
        });

        afterEach(() => {
          req = {};
          res = {};
          underTest.parseCtx.restore();
          validate.restore();
          isManual.restore();
          mapValidationErrors.restore();
          isInValidManualData.restore();
          isInValidSearchData.restore();
          mapRespondentSolicitorData.restore();
        });

        it('should redirect to nextStep (Reasons for divorce) when valid data is posted', done => {
          co(function* generator() {
            validate.returns([true]);
            isManual.returns(false);
            mapValidationErrors.returns(true);

            yield underTest.postRequest(req, res);

            expect(isInValidManualData.calledOnce).to.equal(true);
            expect(isInValidSearchData.calledOnce).to.equal(true);
            expect(res.redirect.calledWith(underTest.nextStep.url)).to.equal(true);
            done();
          });
        });

        it('should redirect to manual view when invalid data is posted and its manual', done => {
          co(function* generator() {
            validate.returns([false]);
            isManual.returns(true);
            isInValidManualData.callThrough();

            yield underTest.postRequest(req, res);

            expect(mapRespondentSolicitorData.calledOnce).to.equal(true);
            expect(isInValidManualData.calledOnce).to.equal(true);
            expect(isInValidSearchData.calledOnce).to.equal(false);
            expect(res.redirect.calledWith(`${underTest.url}/manual`)).to.equal(true);
            done();
          });
        });

        it('should redirect to search view when invalid data is posted and its not manual', done => {
          co(function* generator() {
            validate.returns([false]);
            isManual.returns(false);
            isInValidSearchData.callThrough();
            isInValidManualData.callThrough();

            yield underTest.postRequest(req, res);

            expect(mapRespondentSolicitorData.calledOnce).to.equal(true);
            expect(isInValidManualData.calledOnce).to.equal(true);
            expect(isInValidSearchData.calledOnce).to.equal(true);
            expect(res.redirect.calledWith(underTest.url)).to.equal(true);
            done();
          });
        });
      });
    });
  });
});

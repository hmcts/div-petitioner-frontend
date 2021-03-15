/* eslint no-unused-expressions: "off" */
/* eslint  max-nested-callbacks: "off" */
const request = require('supertest');
const {
  testContent,
  testExistence
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/respondent/correspondence/solicitor-search';
const content = require(`${modulePath}/content`);

const contentStrings = content.resources.en.translation.content;

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
          testContent(done, agent, underTest, content, session, excludedKeys, { divorceWho: 'wife' }, false);
        });

        xit('renders the content from the content file', done => {
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

      describe('Search view when no results:', () => {
        beforeEach(done => {
          session = { divorceWho: 'wife', organisations: [], respondentSolicitorFirm: 'test' };
          withSession(done, agent, session);
        });

        afterEach(() => {
          session = {};
        });

        it('should display correct no search result paragraph 1', done => {
          testExistence(done, agent, underTest, contentStrings.searchNoResults.paragraph1);
        });

        it('should display correct no search result paragraph 1', done => {
          testExistence(done, agent, underTest, contentStrings.searchNoResults.paragraph2);
        });

        it('should display correct no search result paragraph 1', done => {
          testExistence(done, agent, underTest, contentStrings.searchNoResults.paragraph3);
        });
      });
    });
  });
});

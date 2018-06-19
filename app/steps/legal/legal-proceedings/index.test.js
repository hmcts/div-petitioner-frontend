const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA, testNoneExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const server = require('app');
const { withSession } = require('test/util/setup');
const idamMock = require('test/mocks/idam');
const { clone } = require('lodash');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');

const modulePath = 'app/steps/legal/legal-proceedings';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.LegalProceedings;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'husband' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const ignoredContent = ['furtherDetails', 'youShouldInclude', 'caseNumbers', 'proceedingAreAbout', 'namesInvolved', 'courtNames', 'country', 'datesBegan', 'orderDetails', 'datesFuture', 'ongoing', 'proceedingsRelated', 'marriage', 'children', 'property', 'caseDetailsInputTitle'];
      testContent(done, agent, underTest, content, session, ignoredContent);
    });

    it('renders errors for missing required context', done => {
      const context = {};
      const ignoredContent = ['furtherDetails', 'youShouldInclude', 'caseNumbers', 'proceedingAreAbout', 'namesInvolved', 'courtNames', 'country', 'datesBegan', 'orderDetails', 'datesFuture', 'ongoing', 'proceedingsRelated', 'marriage', 'children', 'property', 'caseDetailsInputTitle'];

      testErrors(done, agent, underTest, context,
        content, 'required', ignoredContent);
    });

    it('redirects to the next page if no legal proceedings', done => {
      const context = { legalProceedings: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.FinancialArrangements);
    });

    it('renders errors if legal proceedings but neither related or details have been answered', done => {
      const context = { legalProceedings: 'Yes' };
      const ignoredContent = ['related'];

      testErrors(done, agent, underTest, context,
        content, 'required', ignoredContent);
    });

    it('renders errors if legal proceedings and related have been answered but not details', done => {
      const context = {
        legalProceedings: 'Yes',
        related: ['children']
      };
      const ignoredContent = ['details'];

      testErrors(done, agent, underTest, context,
        content, 'required', ignoredContent);
    });

    it('renders errors if legal proceedings and details have been answered but not related', done => {
      const context = {
        legalProceedings: 'Yes',
        details: 'details'
      };
      const ignoredContent = ['related'];

      testErrors(done, agent, underTest, context,
        content, 'required', ignoredContent);
    });

    it('redirects to the next page if both petitioner and Children are in financial order ', done => {
      const context = {
        legalProceedings: 'Yes',
        legalProceedingsDetails: 'details',
        legalProceedingsRelated: ['children']
      };

      testRedirect(done, agent, underTest, context,
        s.steps.FinancialArrangements);
    });
  });

  describe('Watched session values', () => {
    it('removes legalProceedingsRelated if legalProceedings is changed to NO', () => {
      const previousSession = {
        legalProceedings: 'Yes',
        legalProceedingsRelated: 'marriage'
      };

      const session = clone(previousSession);
      session.legalProceedings = 'No';

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.legalProceedingsRelated).to.equal('undefined');
    });

    it('does not remove legalProceedingsRelated if legalProceedings is changed to YES', () => {
      const previousSession = {
        legalProceedings: 'No',
        legalProceedingsRelated: 'marriage'
      };

      const session = clone(previousSession);
      session.legalProceedings = 'Yes';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.legalProceedingsRelated)
        .to.equal(previousSession.legalProceedingsRelated);
    });

    it('removes legalProceedingsDetails if legalProceedings is changed to NO', () => {
      const previousSession = {
        legalProceedings: 'Yes',
        legalProceedingsDetails: 'details'
      };

      const session = clone(previousSession);
      session.legalProceedings = 'No';

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.legalProceedingsDetails).to.equal('undefined');
    });

    it('does not remove legalProceedingsDetails if legalProceedings is changed to YES', () => {
      const previousSession = {
        legalProceedings: 'No',
        legalProceedingsDetails: 'details'
      };

      const session = clone(previousSession);
      session.legalProceedings = 'Yes';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.legalProceedingsDetails)
        .to.equal(previousSession.legalProceedingsDetails);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders page when legal proceedings is no', done => {
      const contentToExist = [
        'question',
        'no'
      ];

      const valuesToExist = [];

      const context = { legalProceedings: 'No' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders page when legal proceedings is yes and all options selected', done => {
      const contentToExist = [
        'question',
        'proceedingsRelated',
        'marriage',
        'children',
        'property'
      ];

      const valuesToExist = [
        'legalProceedingsRelated',
        'legalProceedingsDetails'
      ];

      const context = {
        legalProceedings: 'Yes',
        legalProceedingsRelated: ['marriage', 'children', 'property'],
        legalProceedingsDetails: 'details...'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('does not render details if not answered', done => {
      const contentToNotExist = [];

      const valuesToNotExist = ['legalProceedingsDetails'];

      const context = {
        legalProceedings: 'Yes',
        legalProceedingsRelated: ['marriage', 'children', 'property']
      };

      testNoneExistenceCYA(done, underTest, content,
        contentToNotExist, valuesToNotExist, context);
    });
  });
});

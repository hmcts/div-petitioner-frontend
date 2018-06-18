const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA, testNoneExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const server = require('app');
const { withSession } = require('test/util/setup');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/financial/arrangements';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.FinancialArrangements;
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
      testContent(done, agent, underTest, content, session);
    });


    it('renders errors for missing required context', done => {
      const context = {};
      const ignoredContent = ['whoItsFor', 'selectAll'];

      testErrors(done, agent, underTest, context,
        content, 'required', ignoredContent);
    });

    it('redirects to the next page if a financial order is not required', done => {
      const context = { financialOrder: 'No' };

      testRedirect(done, agent, underTest, context, s.steps.ClaimCosts);
    });

    it('renders errors if financial order is required and neither petitioner or Children are in financial order ', done => {
      const context = { financialOrder: 'Yes' };
      const ignoredContent = ['whoItsFor', 'selectAll'];

      testErrors(done, agent, underTest, context,
        content, 'required', ignoredContent);
    });

    it('redirects to the next page if both petitioner and Children are in financial order ', done => {
      const context = {
        financialOrder: 'Yes',
        financialOrderFor: ['petitioner', 'children']
      };

      testRedirect(done, agent, underTest, context, s.steps.FinancialAdvice);
    });

    it('redirects to the next page if financial order is for petitioner ', done => {
      const context = {
        financialOrder: 'Yes',
        financialOrderFor: ['petitioner']
      };

      testRedirect(done, agent, underTest, context, s.steps.FinancialAdvice);
    });

    it('redirects to the next page if financial order is for children ', done => {
      const context = {
        financialOrder: 'Yes',
        financialOrderFor: ['children']
      };

      testRedirect(done, agent, underTest, context, s.steps.FinancialAdvice);
    });
  });

  describe('Watched session values', () => {
    it('removes financialOrderFor if financialOrder is changed to no', () => {
      const previousSession = {
        financialOrder: 'Yes',
        financialOrderFor: ['petitioner']
      };

      const session = clone(previousSession);
      session.financialOrder = 'No';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.financialOrder).to.equal('No');
      expect(typeof newSession.financialOrderFor).to.equal('undefined');
    });

    it('does not modify financialOrderFor if financialOrder is changed to yes', () => {
      const previousSession = {
        financialOrder: 'No',
        financialOrderFor: ['petitioner']
      };

      const session = clone(previousSession);
      session.financialOrder = 'Yes';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.financialOrder).to.equal('Yes');
      expect(newSession.financialOrderFor)
        .to.deep.equal(previousSession.financialOrderFor);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('shows user answered no', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['financialOrder'];

      const context = { financialOrder: 'No' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('shows details if user answered yes to petitioner', done => {
      const contentToExist = [
        'question',
        'whoItsFor',
        'petitioner'
      ];

      const valuesToExist = ['financialOrder'];

      const context = {
        financialOrder: 'Yes',
        financialOrderFor: ['petitioner']
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('shows details if user answered yes to children', done => {
      const contentToExist = [
        'question',
        'whoItsFor',
        'children'
      ];

      const valuesToExist = ['financialOrder'];

      const context = {
        financialOrder: 'Yes',
        financialOrderFor: ['children']
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('shows details if user answered yes to children and petitioner', done => {
      const contentToExist = [
        'question',
        'whoItsFor',
        'children',
        'petitioner'
      ];

      const valuesToExist = ['financialOrder'];

      const context = {
        financialOrder: 'Yes',
        financialOrderFor: ['children', 'petitioner']
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('does not shows details if user answered no', done => {
      const contentToNotExist = [
        'whoItsFor',
        'children'
      ];

      const valuesToNotExist = [];

      const context = {
        financialOrder: 'No',
        financialOrderFor: ['children']
      };

      testNoneExistenceCYA(done, underTest, content,
        contentToNotExist, valuesToNotExist, context);
    });
  });
});

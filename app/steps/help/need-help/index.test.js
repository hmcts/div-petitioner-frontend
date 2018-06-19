const request = require('supertest');
const {
  testContent, testErrors, testRedirect,
  testCYATemplate, testExistenceCYA
} = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');
const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/steps/help/need-help';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};
const two = 2;

describe(modulePath, () => {
  beforeEach(() => {
    sinon.stub(applicationFeeMiddleware, 'updateApplicationFeeMiddleware')
      .callsArgWith(two);
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.NeedHelpWithFees;
  });

  afterEach(() => {
    idamMock.restore();
    applicationFeeMiddleware.updateApplicationFeeMiddleware.restore();
  });

  describe('#middleware', () => {
    it('returns updateApplicationFeeMiddleware in middleware', () => {
      expect(underTest.middleware
        .includes(applicationFeeMiddleware.updateApplicationFeeMiddleware))
        .to.eql(true);
    });
  });

  describe('success', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });

    it('redirects to the next page (Yes)', done => {
      const context = { helpWithFeesNeedHelp: 'Yes' };

      testRedirect(done, agent, underTest, context, s.steps.WithFees);
    });

    it('redirects to the next page (No)', done => {
      const context = { helpWithFeesNeedHelp: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.MarriageHusbandOrWife);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders help with fees answer and question', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['helpWithFeesNeedHelp'];

      const context = { helpWithFeesNeedHelp: 'Yes' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

const request = require('supertest');
const server = require('app');
const idamMock = require('test/mocks/idam');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');

const modulePath = 'app/steps/pay/how';
const { removeStaleData } = require('app/core/staleDataManager');
const { expect, sinon } = require('test/util/chai');
const { clone } = require('lodash');
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');

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
    underTest = s.steps.PayHow;
  });


  afterEach(() => {
    applicationFeeMiddleware.updateApplicationFeeMiddleware.restore();
    s.http.close();
    idamMock.restore();
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

    it('redirects to the next page', done => {
      const context = { paymentMethod: 'cheque' };
      testRedirect(done, agent, underTest, context,
        s.steps.CheckYourAnswers);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });

    it('redirects to the next page - card court call', done => {
      const context = { paymentMethod: 'card-phone-court' };

      testRedirect(done, agent, underTest, context, s.steps.PayByPhoneCourt);
    });

    it('returns enabledAfterSubmission', () => {
      expect(underTest.enabledAfterSubmission).to.equal(true);
    });
  });

  describe('Watched session values', () => {
    it('removes paymentMethod if helpWithFeesNeedHelp is changed', () => {
      const previousSession = {
        paymentMethod: 'card',
        helpWithFeesNeedHelp: 'No'
      };

      const session = clone(previousSession);
      session.helpWithFeesNeedHelp = 'Yes';

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.paymentMethod).to.equal('undefined');
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when paymentMethod is card-phone-court', done => {
      const contentToExist = [
        'question',
        'byCardOverPhoneCourt'
      ];

      const valuesToExist = [];

      const context = { paymentMethod: 'card-phone-court' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders when paymentMethod is card-phone-court', done => {
      const contentToExist = [
        'question',
        'byCardOverPhoneCourt'
      ];

      const valuesToExist = [];

      const context = { paymentMethod: 'card-phone-court' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders when paymentMethod is cheque', done => {
      const contentToExist = [
        'question',
        'byCheque'
      ];

      const valuesToExist = [];

      const context = { paymentMethod: 'cheque' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

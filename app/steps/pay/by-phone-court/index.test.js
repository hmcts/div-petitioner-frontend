const request = require('supertest');
const server = require('app');
const idamMock = require('test/mocks/idam');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');

const modulePath = 'app/steps/pay/by-phone-court';
const { removeStaleData } = require('app/core/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.PayByPhoneCourt;
  });


  afterEach(() => {
    s.http.close();
    idamMock.restore();
  });


  describe('success', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });

    it('redirects to the next page', done => {
      const context = {
        paymentTimeToCall: 'morning',
        paymentPhoneNumber: '02027423587'
      };

      testRedirect(done, agent, underTest, context, s.steps.CheckYourAnswers);
    });

    it('returns enabledAfterSubmission', () => {
      expect(underTest.enabledAfterSubmission).to.equal(true);
    });
  });

  describe('Watched session values', () => {
    it('removes paymentTimeToCall if paymentMethod is changed', () => {
      const previousSession = {
        paymentMethod: 'phone',
        paymentTimeToCall: 'morning'
      };

      const session = clone(previousSession);
      session.paymentMethod = 'card';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.paymentTimeToCall).to.equal('undefined');
    });

    it('removes paymentPhoneNumber if paymentMethod is changed', () => {
      const previousSession = {
        paymentMethod: 'phone',
        paymentPhoneNumber: '0123456789'
      };

      const session = clone(previousSession);
      session.paymentMethod = 'card';

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.paymentPhoneNumber).to.equal('undefined');
    });

    it('removes paymentPhoneNumber and paymentPhoneNumber if paymentMethod is deleted', () => {
      const previousSession = {
        paymentMethod: 'phone',
        paymentPhoneNumber: '0123456789'
      };

      const session = clone(previousSession);
      delete session.paymentMethod;

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.paymentMethod).to.equal('undefined');
      expect(typeof newSession.paymentPhoneNumber).to.equal('undefined');
    });

    it('removes paymentMethod, paymentPhoneNumber if helpWithFeesNeedHelp is set to Yes', () => {
      const previousSession = {
        paymentMethod: 'phone',
        paymentPhoneNumber: '0123456789',
        helpWithFeesNeedHelp: 'No'
      };

      const session = clone(previousSession);
      session.helpWithFeesNeedHelp = 'Yes';

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.paymentMethod).to.equal('undefined');
      expect(typeof newSession.paymentPhoneNumber).to.equal('undefined');
    });

    it('does not remove petitionerPhoneNumber if paymentMethod is changed', () => {
      const previousSession = {
        paymentMethod: 'phone',
        petitionerPhoneNumber: '09876543210'
      };

      const session = clone(previousSession);
      session.paymentMethod = 'card';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.petitionerPhoneNumber)
        .to.equal(previousSession.petitionerPhoneNumber);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when time to call is morning', done => {
      const contentToExist = [
        'callMeMaybe',
        'callMorning',
        'paymentPhoneNumber'
      ];

      const valuesToExist = ['paymentPhoneNumber'];

      const context = {
        paymentPhoneNumber: '0123456789',
        paymentTimeToCall: 'morning'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders when time to call is afternoon', done => {
      const contentToExist = [
        'callMeMaybe',
        'callAfternoon',
        'paymentPhoneNumber'
      ];

      const valuesToExist = ['paymentPhoneNumber'];

      const context = {
        paymentPhoneNumber: '0123456789',
        paymentTimeToCall: 'afternoon'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders when time to call is anytime', done => {
      const contentToExist = [
        'callMeMaybe',
        'callAnytime',
        'paymentPhoneNumber'
      ];

      const valuesToExist = ['paymentPhoneNumber'];

      const context = {
        paymentPhoneNumber: '0123456789',
        paymentTimeToCall: 'anytime'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

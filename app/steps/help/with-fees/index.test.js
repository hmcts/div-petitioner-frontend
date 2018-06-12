const request = require('supertest');
const {
  testContent, testErrors, testRedirect,
  testCYATemplate, testExistenceCYA
} = require('test/util/assertions');
const { clone } = require('lodash');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');

const modulePath = 'app/steps/help/with-fees';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.WithFees;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });

    it('renders errors for missing required context (not selecting answer)', done => {
      const context = {};

      testErrors(done, agent, underTest, context,
        content, 'required', ['helpWithFeesAppliedForFees']);
    });

    it('renders errors for missing required context (selecting YES but not providing reference)', done => {
      const context = { helpWithFeesAppliedForFees: 'Yes' };

      testErrors(done, agent, underTest, context,
        content, 'required', ['helpWithFeesReferenceNumber']);
    });

    it('renders errors for providing invalid reference number', done => {
      const context = {
        helpWithFeesAppliedForFees: 'Yes',
        helpWithFeesReferenceNumber: 'ABC-0Ks!X?V'
      };

      testErrors(done, agent, underTest, context,
        content, 'invalid', ['helpWithFeesReferenceNumber']);
    });

    it('redirects to the next page when No selected', done => {
      const context = { helpWithFeesAppliedForFees: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.ExitNoHelpWithFees);
    });

    it('redirects to the next page when No selected and HWF number not correct', done => {
      const context = {
        helpWithFeesAppliedForFees: 'No',
        helpWithFeesReferenceNumber: 'WrongHWF'
      };

      testRedirect(done, agent, underTest, context,
        s.steps.ExitNoHelpWithFees);
    });

    it('redirects to the next page when Yes selected and HWF number correct', done => {
      const context = {
        helpWithFeesAppliedForFees: 'Yes',
        helpWithFeesReferenceNumber: 'HWF-123-456'
      };

      testRedirect(done, agent, underTest, context,
        s.steps.MarriageHusbandOrWife);
    });

    it('redirects to the next page when Yes selected and HWF number correct', done => {
      const context = {
        helpWithFeesAppliedForFees: 'Yes',
        helpWithFeesReferenceNumber: 'HwF-1A3-45B'
      };

      testRedirect(done, agent, underTest, context,
        s.steps.MarriageHusbandOrWife);
    });
  });


  describe('Reference number validation', () => {
    it('renders errors for providing too long reference number', done => {
      const context = {
        helpWithFeesAppliedForFees: 'Yes',
        helpWithFeesReferenceNumber: 'HWF-123-1234'
      };

      testErrors(done, agent, underTest, context,
        content, 'invalid', ['helpWithFeesReferenceNumber']);
    });

    it('renders errors for providing too short reference number', done => {
      const context = {
        helpWithFeesAppliedForFees: 'Yes',
        helpWithFeesReferenceNumber: 'HWF-12-123'
      };

      testErrors(done, agent, underTest, context,
        content, 'invalid', ['helpWithFeesReferenceNumber']);
    });

    it('renders errors for providing too short reference number with no dashes', done => {
      const context = {
        helpWithFeesAppliedForFees: 'Yes',
        helpWithFeesReferenceNumber: 'hwf12123'
      };

      testErrors(done, agent, underTest, context,
        content, 'invalid', ['helpWithFeesReferenceNumber']);
    });

    it('renders errors for providing invalid first letter order in reference number', done => {
      const context = {
        helpWithFeesAppliedForFees: 'Yes',
        helpWithFeesReferenceNumber: 'hfw12123'
      };

      testErrors(done, agent, underTest, context,
        content, 'invalid', ['helpWithFeesReferenceNumber']);
    });

    it('renders errors for providing just numbers in reference number', done => {
      const context = {
        helpWithFeesAppliedForFees: 'Yes',
        helpWithFeesReferenceNumber: '123123'
      };

      testErrors(done, agent, underTest, context,
        content, 'invalid', ['helpWithFeesReferenceNumber']);
    });

    it('renders errors for providing reference number in invalid format HWF-1234-12', done => {
      const context = {
        helpWithFeesAppliedForFees: 'Yes',
        helpWithFeesReferenceNumber: 'HWF-1234-12'
      };

      testErrors(done, agent, underTest, context,
        content, 'invalid', ['helpWithFeesReferenceNumber']);
    });

    it('renders errors for providing too long reference number', done => {
      const context = {
        helpWithFeesAppliedForFees: 'Yes',
        helpWithFeesReferenceNumber: 'HWF-1234-123'
      };

      testErrors(done, agent, underTest, context,
        content, 'invalid', ['helpWithFeesReferenceNumber']);
    });
  });

  describe('Watched session values', () => {
    it('removes helpWithFeesAppliedForFees and helpWithFeesReferenceNumber if helpWithFeesNeedHelp is set to No', () => {
      const previousSession = {
        helpWithFeesNeedHelp: 'Yes',
        helpWithFeesAppliedForFees: 'Yes',
        helpWithFeesReferenceNumber: 'HWF-123-1234'
      };

      const session = clone(previousSession);
      session.helpWithFeesNeedHelp = 'No';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.helpWithFeesNeedHelp).to.equal('No');
      expect(typeof newSession.helpWithFeesAppliedForFees)
        .to.equal('undefined');
      expect(typeof newSession.helpWithFeesReferenceNumber)
        .to.equal('undefined');
    });

    it('does not remove helpWithFeesAppliedForFees or helpWithFeesReferenceNumber if helpWithFeesNeedHelp is set to Yes', () => {
      const previousSession = {
        helpWithFeesNeedHelp: 'No',
        helpWithFeesAppliedForFees: 'Yes',
        helpWithFeesReferenceNumber: 'HWF-123-1234'
      };

      const session = clone(previousSession);
      session.helpWithFeesNeedHelp = 'Yes';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.helpWithFeesNeedHelp).to.equal('Yes');
      expect(newSession.helpWithFeesAppliedForFees)
        .to.equal(previousSession.helpWithFeesAppliedForFees);
      expect(newSession.helpWithFeesReferenceNumber)
        .to.equal(previousSession.helpWithFeesReferenceNumber);
    });

    it('removes helpWithFeesReferenceNumber if helpWithFeesAppliedForFees is set to no', () => {
      const previousSession = {
        helpWithFeesNeedHelp: 'Yes',
        helpWithFeesAppliedForFees: 'Yes',
        helpWithFeesReferenceNumber: 'HWF-123-1234'
      };

      const session = clone(previousSession);
      session.helpWithFeesAppliedForFees = 'No';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.helpWithFeesNeedHelp)
        .to.equal(previousSession.helpWithFeesNeedHelp);
      expect(newSession.helpWithFeesAppliedForFees).to.equal('No');
      expect(typeof newSession.helpWithFeesReferenceNumber)
        .to.equal('undefined');
    });

    it('does not remove helpWithFeesReferenceNumber if helpWithFeesAppliedForFees is set to yes', () => {
      const previousSession = {
        helpWithFeesNeedHelp: 'Yes',
        helpWithFeesAppliedForFees: 'No',
        helpWithFeesReferenceNumber: 'HWF-123-1234'
      };

      const session = clone(previousSession);
      session.helpWithFeesAppliedForFees = 'Yes';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.helpWithFeesNeedHelp)
        .to.equal(previousSession.helpWithFeesNeedHelp);
      expect(newSession.helpWithFeesAppliedForFees).to.equal('Yes');
      expect(newSession.helpWithFeesReferenceNumber)
        .to.equal(previousSession.helpWithFeesReferenceNumber);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders HWF number', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['helpWithFeesReferenceNumber'];

      const context = { helpWithFeesReferenceNumber: 'HWF-A1B-23C' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

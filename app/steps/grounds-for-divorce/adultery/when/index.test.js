/* eslint no-console: "off"*/
const request = require('supertest');
const {
  testContent, testErrors, testRedirect,
  testCYATemplate, testExistenceCYA,
  postData, expectSessionValue
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/grounds-for-divorce/adultery/when';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.AdulteryWhen;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });

    it('redirects to the next page when the user knows when', done => {
      const context = { reasonForDivorceAdulteryKnowWhen: 'Yes' };

      testRedirect(done, agent, underTest, context, s.steps.AdulteryDetails);
    });

    it('redirects to the next page when user does not know when', done => {
      const context = { reasonForDivorceAdulteryKnowWhen: 'No' };

      testRedirect(done, agent, underTest, context, s.steps.AdulteryDetails);
    });
  });

  describe('setting details on session', () => {
    beforeEach(done => {
      const session = { divorceWho: 'wife', reasonForDivorceAdulteryWhenDetails: 'placeholder' };
      withSession(done, agent, session);
    });

    it('does not modify when details when user knows when', done => {
      const context = { reasonForDivorceAdulteryKnowWhen: 'Yes' };

      postData(agent, underTest.url, context).then(
        expectSessionValue(
          'reasonForDivorceAdulteryWhenDetails',
          'placeholder',
          agent,
          done
        )
      );
    });

    it('sets the know when details when user does not know when', done => {
      const context = { reasonForDivorceAdulteryKnowWhen: 'No' };

      postData(agent, underTest.url, context).then(
        expectSessionValue(
          'reasonForDivorceAdulteryWhenDetails',
          'The applicant does not know when the adultery took place',
          agent,
          done
        )
      );
    });
  });

  describe('Watched session values', () => {
    it('removes reasonForDivorceAdulteryKnowWhen if reasonForDivorceAdulteryWishToName is set to No', () => {
      const previousSession = {
        reasonForDivorceAdulteryWishToName: 'Yes',
        reasonForDivorceAdulteryKnowWhen: 'Yes'
      };

      const session = clone(previousSession);
      session.reasonForDivorceAdulteryWishToName = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorceAdulteryWishToName).to.equal('No');
      expect(typeof newSession.reasonForDivorceAdulteryKnowWhen)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceAdulteryWhenDetails)
        .to.equal('undefined');
    });

    it('removes reasonForDivorceAdulteryKnowWhen if reasonForDivorceAdulteryWishToName is not defined', () => {
      const previousSession = {
        reasonForDivorceAdulteryWishToName: 'Yes',
        reasonForDivorceAdulteryKnowWhen: 'Yes'
      };

      const session = clone(previousSession);
      delete session.reasonForDivorceAdulteryWishToName;

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.reasonForDivorceAdulteryWishToName)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceAdulteryKnowWhen)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceAdulteryWhenDetails)
        .to.equal('undefined');
    });

    it('it does not remove reasonForDivorceAdulteryKnowWhen if reasonForDivorceAdulteryWishToName is set to Yes', () => {
      const previousSession = {
        reasonForDivorceAdulteryWishToName: 'No',
        reasonForDivorceAdulteryKnowWhen: 'Yes'
      };

      const session = clone(previousSession);
      session.reasonForDivorceAdulteryWishToName = 'Yes';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorceAdulteryWishToName).to.equal('Yes');
      expect(newSession.reasonForDivorceAdulteryKnowWhen)
        .to.equal(previousSession.reasonForDivorceAdulteryKnowWhen);
      expect(newSession.reasonForDivorceAdulteryWhenDetails)
        .to.equal(previousSession.reasonForDivorceAdulteryWhenDetails);
    });

    it('it does not remove reasonForDivorceAdulteryWhenDetails if reasonForDivorceAdulteryKnowWhen is not changed from No', () => {
      const previousSession = {
        reasonForDivorceAdulteryKnowWhen: 'Yes',
        reasonForDivorceAdulteryWhenDetails: 'placeholder'
      };

      const session = clone(previousSession);
      session.reasonForDivorceAdulteryKnowWhen = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorceAdulteryWhenDetails)
        .to.equal(previousSession.reasonForDivorceAdulteryWhenDetails);
    });

    it('it does remove reasonForDivorceAdulteryWhenDetails if reasonForDivorceAdulteryKnowWhen is changed from No', () => {
      const previousSession = {
        reasonForDivorceAdulteryKnowWhen: 'No',
        reasonForDivorceAdulteryWhenDetails: 'placeholder'
      };

      const session = clone(previousSession);
      session.reasonForDivorceAdulteryKnowWhen = 'Yes';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.reasonForDivorceAdulteryWhenDetails)
        .to.equal('undefined');
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders adultery when details', done => {
      const contentToExist = [ 'question' ];

      const valuesToExist = ['reasonForDivorceAdulteryKnowWhen'];

      const context = { reasonForDivorceAdulteryKnowWhen: 'Yes' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

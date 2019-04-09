const server = require('app');
const request = require('supertest');
const idamMock = require('test/mocks/idam');
const {
  testContent, testErrors, testRedirect,
  testCYATemplate, testExistenceCYA,
  postData, expectSessionValue
} = require('test/util/assertions');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { withSession } = require('test/util/setup');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/grounds-for-divorce/adultery/second-hand-information';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.AdulterySecondHandInfo;
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

    it('redirects to the next page when the user received information from another person', done => {
      const context = {
        reasonForDivorceAdulterySecondHandInfo: 'Yes',
        reasonForDivorceAdulterySecondHandInfoDetails: 'placeholder'
      };

      testRedirect(done, agent, underTest, context, s.steps.LegalProceedings);
    });

    it('redirects to the next page when user did not receive information from another person', done => {
      const context = { reasonForDivorceAdulterySecondHandInfo: 'No' };

      testRedirect(done, agent, underTest, context, s.steps.LegalProceedings);
    });
  });

  describe('reporting validation errors', () => {
    it('renders error when no option selected', done => {
      const context = {};
      const onlyKey = [ 'reasonForDivorceAdulterySecondHandInfo'];
      testErrors(done, agent, underTest, context, content, 'required', onlyKey);
    });

    it('renders errors when details not inserted', done => {
      const context = { reasonForDivorceAdulterySecondHandInfo: 'Yes' };
      const onlyKey = [ 'reasonForDivorceAdulterySecondHandInfoDetails'];
      testErrors(done, agent, underTest, context, content, 'invalid', onlyKey);
    });
  });

  describe('setting details on session', () => {
    beforeEach(done => {
      const session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('does not modify second-hand-info details when users has them', done => {
      const context = {
        reasonForDivorceAdulterySecondHandInfo: 'Yes',
        reasonForDivorceAdulterySecondHandInfoDetails: 'placeholder'
      };

      postData(agent, underTest.url, context).then(
        expectSessionValue(
          'reasonForDivorceAdulterySecondHandInfoDetails',
          'placeholder',
          agent,
          done
        )
      );
    });

    it('does not set the second-hand-info details when user does not have second-hand-info details', done => {
      const context = { reasonForDivorceAdulterySecondHandInfo: 'No' };

      postData(agent, underTest.url, context).then(
        expectSessionValue(
          'reasonForDivorceAdulterySecondHandInfoDetails',
          undefined, // eslint-disable-line no-undefined
          agent,
          done
        )
      );
    });
  });

  describe('Watch session values', () => {
    it('removes reasonForDivorceAdulterySecondHandInfoDetails if reasonForDivorce changes', () => {
      const previousSession = {
        reasonForDivorceAdulterySecondHandInfoDetails: 'placeholder',
        reasonForDivorce: 'adultery'
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'seperation-2-years';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.reasonForDivorceAdulterySecondHandInfoDetails)
        .to.equal('undefined');
    });

    it('removes reasonForDivorceAdulterySecondHandInfoDetails if reasonForDivorce changes', () => {
      const previousSession = {
        reasonForDivorceAdulterySecondHandInfo: 'Yes',
        reasonForDivorce: 'adultery'
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'seperation-2-years';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.reasonForDivorceAdulterySecondHandInfo)
        .to.equal('undefined');
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders adultery second-hand-information details', done => {
      const contentToExist = [ 'question' ];

      const valuesToExist = ['reasonForDivorceAdulterySecondHandInfo'];

      const context = { reasonForDivorceAdulterySecondHandInfo: 'Yes' };
      // also add the info details?
      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});
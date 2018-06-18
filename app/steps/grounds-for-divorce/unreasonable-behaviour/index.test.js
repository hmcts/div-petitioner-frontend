const request = require('supertest');
const {
  testContent, testErrors, testRedirect,
  testCYATemplate, testExistenceCYA
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { clone } = require('lodash');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');

const modulePath = 'app/steps/grounds-for-divorce/unreasonable-behaviour';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.UnreasonableBehaviour;
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
      testContent(done, agent, underTest, content, session);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });

    it('redirects to the next page', done => {
      const context = { reasonForDivorceBehaviourDetails: ['The soup was too salty'] };

      testRedirect(done, agent, underTest, context, s.steps.LegalProceedings);
    });
  });

  describe('Watched session values', () => {
    it('removes reasonForDivorceBehaviourDetails if reasonForDivorce changes and isnt unreasonable-behaviour', () => {
      const previousSession = {
        reasonForDivorce: 'unreasonable-behaviour',
        reasonForDivorceBehaviourDetails: ['details...']
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'adultery';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorce).to.equal('adultery');
      expect(typeof newSession.reasonForDivorceBehaviourDetails)
        .to.equal('undefined');
    });

    it('does not remove reasonForDivorceBehaviourDetails if reasonForDivorce is set to unreasonable-behaviour', () => {
      const previousSession = {
        reasonForDivorce: 'adultery',
        reasonForDivorceBehaviourDetails: ['details...']
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'unreasonable-behaviour';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorce).to.equal('unreasonable-behaviour');
      expect(newSession.reasonForDivorceBehaviourDetails)
        .to.equal(previousSession.reasonForDivorceBehaviourDetails);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders reason for divorce unreasonable-behaviour', done => {
      const contentToExist = ['question'];

      const valuesToExist = [
        'reasonForDivorceBehaviourDetails',
        'divorceWho'
      ];

      const context = {
        reasonForDivorceBehaviourDetails: ['details 1...', 'details 2...'],
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

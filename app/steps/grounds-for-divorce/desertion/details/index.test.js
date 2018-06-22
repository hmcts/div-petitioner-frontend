const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/grounds-for-divorce/desertion/details';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.DesertionDetails;
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

      testErrors(done, agent, underTest, context, content, 'required', 'divorceWho', session);
    });

    it('redirects to the next page', done => {
      const context = { reasonForDivorceDesertionDetails: 'They ran away' };

      testRedirect(done, agent, underTest, context, s.steps.LegalProceedings);
    });
  });

  describe('Watched session values', () => {
    it('removes reasonForDivorceDesertionDetails fields if reasonForDivorce is changed', () => {
      const previousSession = {
        reasonForDivorceDesertionDetails: 'Details...',
        reasonForDivorce: 'desertion'
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'anything';

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.reasonForDivorceDesertionDetails)
        .to.equal('undefined');
    });

    it('do not remove reasonForDivorceDesertionDetails fields if reasonForDivorce does not change', () => {
      const previousSession = {
        reasonForDivorceDesertionDetails: 'Details...',
        reasonForDivorce: 'desertion'
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'desertion';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.reasonForDivorceDesertionDetails)
        .to.equal(previousSession.reasonForDivorceDesertionDetails);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders desertion details', done => {
      const contentToExist = [ 'question' ];

      const valuesToExist = [
        'reasonForDivorceDesertionDetails',
        'divorceWho'
      ];

      const context = {
        reasonForDivorceDesertionDetails: 'details',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

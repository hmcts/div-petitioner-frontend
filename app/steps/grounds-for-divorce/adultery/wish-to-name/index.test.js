const request = require('supertest');
const server = require('app');
const {
  testContent, testErrors, testRedirect,
  testCYATemplate, testExistenceCYA
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/grounds-for-divorce/adultery/wish-to-name';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.AdulteryWishToName;
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

      testErrors(done, agent, underTest, context,
        content, 'required', [], session);
    });

    it('redirects to the next page (wish to name)', done => {
      const context = { reasonForDivorceAdulteryWishToName: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.Adultery3rdPartyDetails);
    });

    it('redirects to the next page (not naming corespondent)', done => {
      const context = { reasonForDivorceAdulteryWishToName: 'No' };

      testRedirect(done, agent, underTest, context, s.steps.AdulteryWhere);
    });
  });

  describe('Watched session values', () => {
    it('removes reasonForDivorceAdulteryWishToName if reasonForDivorce does not equal adultery', () => {
      const previousSession = {
        reasonForDivorce: 'adultery',
        reasonForDivorceAdulteryWishToName: 'Yes'
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'desertion';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorce).to.equal('desertion');
      expect(typeof newSession.reasonForDivorceAdulteryWishToName)
        .to.equal('undefined');
    });

    it('it does not remove reasonForDivorceAdulteryWishToName if reasonForDivorce is set to adultery', () => {
      const previousSession = {
        reasonForDivorce: 'desertion',
        reasonForDivorceAdulteryWishToName: 'Yes'
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'adultery';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorce).to.equal('adultery');
      expect(newSession.reasonForDivorceAdulteryWishToName)
        .to.equal(previousSession.reasonForDivorceAdulteryWishToName);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders adultery where details', done => {
      const contentToExist = [ 'question' ];

      const valuesToExist = [
        'reasonForDivorceAdulteryWishToName',
        'divorceWho'
      ];

      const context = {
        reasonForDivorceAdulteryWishToName: 'Yes',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});

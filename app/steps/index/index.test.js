const request = require('supertest');
const { testContent, testRedirect } = require('test/util/assertions');
const server = require('app');
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');
const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/steps/index';
const content = require(`${modulePath}/content`);

const featureTogglesMock = require('test/mocks/featureToggles');
const { withSession } = require('test/util/setup');

let s = {};
let agent = {};
let underTest = {};
const two = 2;

describe(modulePath, () => {
  beforeEach(() => {
    sinon.stub(applicationFeeMiddleware, 'updateApplicationFeeMiddleware')
      .callsArgWith(two);
    featureTogglesMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.Index;
  });


  afterEach(() => {
    s.http.close();
    featureTogglesMock.restore();
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
    beforeEach(done => {
      withSession(done, agent);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });

    it('redirects to the next page', done => {
      testRedirect(done, agent, underTest, {},
        s.steps.ScreeningQuestionsMarriageBroken);
    });
  });
});

const request = require('supertest');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { testContent, testRedirect } = require('test/util/assertions');
const featureTogglesMock = require('test/mocks/featureToggles');
const { updateApplicationFeeMiddleware } = require('app/middleware/updateApplicationFeeMiddleware');
const { expect } = require('test/util/chai');

const modulePath = 'app/steps/pay/pay-online-only';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    featureTogglesMock.stub();
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.PayOnline;
  });


  afterEach(() => {
    s.http.close();
    idamMock.restore();
    featureTogglesMock.restore();
  });


  describe('#middleware', () => {
    it('returns updateApplicationFeeMiddleware in middleware', () => {
      expect(underTest.middleware.includes(updateApplicationFeeMiddleware))
        .to.eql(true);
    });
  });

  describe('success', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });

    it('redirects to PayByCard if onlineSubmission is on', done => {
      const featureMock = featureTogglesMock.when('onlineSubmission', true, testRedirect, agent, underTest, {}, s.steps.PayByCard);

      featureMock(done);
    });

    it('redirects to PayHow if onlineSubmission is off', done => {
      const featureMock = featureTogglesMock.when('onlineSubmission', false, testRedirect, agent, underTest, {}, s.steps.PayHow);

      featureMock(done);
    });
  });
});
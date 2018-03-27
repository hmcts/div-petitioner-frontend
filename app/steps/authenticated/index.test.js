/* eslint-disable max-nested-callbacks */
const request = require('supertest');
const { testRedirect, getSession } = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');
const featureTogglesMock = require('test/mocks/featureToggles');
const idam = require('app/services/idam');
const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/steps/authenticated';

let s = {};
let agent = {};
let underTest = {};
let landingPageStub = {};
const two = 2;

describe(modulePath, () => {
  beforeEach(() => {
    landingPageStub = sinon.stub().callsArgWith(two);
    sinon.stub(idam, 'landingPage').returns(landingPageStub);
    idamMock.stub();
    s = server.init();
    featureTogglesMock.stub();
    agent = request.agent(s.app);
    underTest = s.steps.Authenticated;
  });


  afterEach(() => {
    s.http.close();
    idamMock.restore();
    featureTogglesMock.restore();
    idam.landingPage.restore();
  });


  describe('success', () => {
    it('should immediately redirect to the has marriage broken step page', done => {
      const context = {};

      testRedirect(done, agent, underTest, context,
        s.steps.ScreeningQuestionsMarriageBroken);
    });
  });

  describe('idam on', () => {
    it('redirects to the landing page', done => {
      const context = {};

      const featureMock = featureTogglesMock
        .when('idam', true, testRedirect, agent, underTest, context, s.steps.ScreeningQuestionsMarriageBroken);

      featureMock(() => {
        getSession(agent)
          .then(() => {
            expect(landingPageStub.calledOnce).to.eql(true);
          })
          .then(done, done);
      });
    });
  });
});
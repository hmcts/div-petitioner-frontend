/* eslint-disable max-nested-callbacks */
const request = require('supertest');
const { testRedirect, getSession, testCustom } = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');
const featureToggleConfig = require('test/util/featureToggles');
const idam = require('app/services/idam');
const { expect, sinon } = require('test/util/chai');
const { withSession } = require('test/util/setup');
const { mockSession } = require('test/fixtures');
const { clone } = require('lodash');
const checkCookiesAllowed = require('app/middleware/checkCookiesAllowed');
const initSession = require('app/middleware/initSession');

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
    agent = request.agent(s.app);
    underTest = s.steps.Authenticated;
  });


  afterEach(() => {
    idamMock.restore();
    idam.landingPage.restore();
  });

  describe('#middleware', () => {
    it('includes checkCookiesAllowed in middleware', () => {
      expect(underTest.middleware
        .includes(checkCookiesAllowed))
        .to.eql(true);
    });

    it('includes initSession in middleware', () => {
      expect(underTest.middleware
        .includes(initSession))
        .to.eql(true);
    });
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

      const featureTest = featureToggleConfig
        .when('idam', true, testRedirect, agent, underTest, context, s.steps.ScreeningQuestionsMarriageBroken);

      featureTest(() => {
        getSession(agent)
          .then(() => {
            expect(landingPageStub.calledOnce).to.eql(true);
          })
          .then(done, done);
      });
    });

    describe('with expired session', () => {
      const session = clone(mockSession);
      beforeEach(done => {
        session.expires = 1;
        withSession(done, agent, session);
      });

      it('ensure session data is regenerated if expired after user login', done => {
        expect(session.hasOwnProperty('allocatedCourt')).to.eql(true);

        const testSession = () => {
          getSession(agent)
            .then(newSession => {
              expect(newSession.hasOwnProperty('allocatedCourt')).to.eql(false);
              expect(newSession.hasOwnProperty('expires')).to.eql(true);
            })
            .then(done, done);
        };

        const emptyCallback = () => {}; // eslint-disable-line

        const featureTest = featureToggleConfig
          .when('idam', true, testCustom, agent, underTest, [], emptyCallback, 'post', false);
        featureTest(testSession);
      });
    });

    describe('with valid session', () => {
      const session = clone(mockSession);
      beforeEach(done => {
        const thousand = 1000;
        session.expires = Date.now() + thousand;
        withSession(done, agent, session);
      });

      it('ensure session data is still there after user login', done => {
        expect(session.hasOwnProperty('allocatedCourt')).to.eql(true);

        const testSession = () => {
          getSession(agent)
            .then(newSession => {
              expect(newSession.hasOwnProperty('allocatedCourt')).to.eql(true);
            })
            .then(done, done);
        };

        const emptyCallback = () => {}; // eslint-disable-line

        const featureTest = featureToggleConfig
          .when('idam', true, testCustom, agent, underTest, [], emptyCallback, 'post', false);
        featureTest(testSession);
      });
    });
  });
});

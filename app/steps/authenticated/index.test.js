/* eslint-disable max-nested-callbacks */
const request = require('supertest');
const { testRedirect, getSession, testCustom } = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');
const featureTogglesMock = require('test/mocks/featureToggles');
const idam = require('app/services/idam');
const { expect, sinon } = require('test/util/chai');
const { withSession } = require('test/util/setup');
const { mockSession } = require('test/fixtures');
const { clone } = require('lodash');

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

    describe('with expired session', () => {
      const session = clone(mockSession);
      beforeEach(done => {
        session.expires = 1;
        withSession(done, agent, session);
      });

      it('ensure session data is destroyed if expired after user login', done => {
        expect(session.hasOwnProperty('courts')).to.eql(true);

        const testSession = () => {
          getSession(agent)
            .then(newSession => {
              expect(newSession.hasOwnProperty('courts')).to.eql(false);
            })
            .then(done, done);
        };

        const emptyCallback = () => {}; // eslint-disable-line

        const featureMock = featureTogglesMock
          .when('idam', true, testCustom, agent, underTest, [], emptyCallback, 'post', false);
        featureMock(testSession);
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
        expect(session.hasOwnProperty('courts')).to.eql(true);

        const testSession = () => {
          getSession(agent)
            .then(newSession => {
              expect(newSession.hasOwnProperty('courts')).to.eql(true);
            })
            .then(done, done);
        };

        const emptyCallback = () => {}; // eslint-disable-line

        const featureMock = featureTogglesMock
          .when('idam', true, testCustom, agent, underTest, [], emptyCallback, 'post', false);
        featureMock(testSession);
      });
    });
  });
});

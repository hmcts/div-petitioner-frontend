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
const idamUserDetails = { email: 'simulate-delivered@notifications.service.gov.uk' };
const two = 2;

describe(modulePath, () => {
  beforeEach(() => {
    landingPageStub = sinon.stub().callsArgWith(two, idamUserDetails);
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
    it('sets the email address returned from the idam user', done => {
      const context = {};

      const featureMock = featureTogglesMock
        .when('idam', true, testRedirect, agent, underTest, context, s.steps.ScreeningQuestionsMarriageBroken);

      featureMock(() => {
        getSession(agent)
          .then(session => {
            expect(session.petitionerEmail).to.eql(idamUserDetails.email);
            expect(landingPageStub.calledOnce).to.eql(true);
          })
          .then(done, done);
      });
    });
  });
});
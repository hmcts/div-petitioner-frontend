const request = require('supertest');
// const { testRedirect, testCustom } = require('test/util/assertions');
const { testCustom } = require('test/util/assertions');
const config = require('config');
const server = require('app');
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');
const idamExpressMiddleware = require('@hmcts/div-idam-express-middleware');
const { expect, sinon } = require('test/util/chai');
const initSession = require('app/middleware/initSession');

const modulePath = 'app/steps/index';

const { withSession } = require('test/util/setup');

let s = {};
let agent = {};
let underTest = {};
const two = 2;

describe(modulePath, () => {
  beforeEach(() => {
    sinon.stub(applicationFeeMiddleware, 'updateApplicationFeeMiddleware')
      .callsArgWith(two);
    s = server.init();
    sinon.stub(idamExpressMiddleware, 'authenticate').callsFake(() => {
      return (req, res, next) => {
        next();
      };
    });
    agent = request.agent(s.app);
    underTest = s.steps.Index;
  });

  afterEach(() => {
    applicationFeeMiddleware.updateApplicationFeeMiddleware.restore();
    idamExpressMiddleware.authenticate.restore();
  });

  describe('#middleware', () => {
    it('includes initSession in middleware', () => {
      expect(underTest.middleware
        .includes(initSession))
        .to.eql(true);
    });
  });

  describe('success', () => {
    beforeEach(done => {
      withSession(done, agent);
    });

    it('should immediately redirect based on redirect feature', done => {
      // const context = {};

      // sinon.spy(underTest, 'nextStep');
      expect(underTest.nextStep(true)).to.eql(s.steps.CutOffLandingPage);
      expect(underTest.nextStep(false)).to.eql(s.steps.ScreeningQuestionsLanguagePreference);

      return done();
    });

    // it('should immediately redirect to the need welsh question step page if authenticated', done => {
    //   const context = {};
    //
    //   testRedirect(done, agent, underTest, context,
    //     s.steps.ScreeningQuestionsLanguagePreference);
    // });

    it('should set up the current host as the redirect uri for idam', done => {
      testCustom(done, agent, underTest, [], response => {
        const hostName = response.request.host.split(':')[0];
        const redirectUri = `https://${response.request.host}/authenticated`;
        const confIdam = config.idamArgs;
        const idamArgs = {
          hostName,
          indexUrl: confIdam.indexUrl,
          idamApiUrl: confIdam.idamApiUrl,
          idamLoginUrl: confIdam.idamLoginUrl,
          idamSecret: confIdam.idamSecret,
          idamClientID: confIdam.idamClientID,
          redirectUri,
          language: 'en'
        };

        sinon.assert.calledWith(idamExpressMiddleware.authenticate, idamArgs);
      });
    });
  });
});

const request = require('supertest');
const { testRedirect, testCustom } = require('test/util/assertions');
const server = require('app');
const idamExpressMiddleware = require('@hmcts/div-idam-express-middleware');
const sinon = require('sinon');
const CONF = require('config');

const modulePath = 'app/steps/start';

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    sinon.stub(idamExpressMiddleware, 'authenticate').callsFake(() => {
      return (req, res, next) => {
        next();
      };
    });
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.Start;
  });

  afterEach(() => {
    idamExpressMiddleware.authenticate.restore();
  });

  describe('success', () => {
    it('should immediately redirect to the has marriage broken step page if authenticated', done => {
      const context = {};

      testRedirect(done, agent, underTest, context,
        s.steps.ScreeningQuestionsMarriageBroken);
    });

    it('should set up the current host as the redirect uri for idam', done => {
      testCustom(done, agent, underTest, [], response => {
        const hostName = response.request.host.split(':')[0];
        const redirectUri = response.request.protocol.concat('//', response.request.host, '/authenticated');
        const confIdam = CONF.idamArgs;
        const idamArgs = {
          hostName,
          indexUrl: confIdam.indexUrl,
          idamApiUrl: process.env.IDAM_API_URL || confIdam.idamApiUrl,
          idamLoginUrl: process.env.IDAM_LOGIN_URL || confIdam.idamLoginUrl,
          idamSecret: process.env.IDAM_SECRET || confIdam.idamSecret,
          idamClientID: process.env.IDAM_CLIENT_ID || confIdam.idamClientID,
          redirectUri
        };

        sinon.assert.calledWith(idamExpressMiddleware.authenticate, idamArgs);
      });
    });
  });
});

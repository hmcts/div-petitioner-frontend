const request = require('supertest');
const { testRedirect } = require('test/util/assertions');
const server = require('app');
const idamExpressMiddleware = require('@hmcts/div-idam-express-middleware');
const sinon = require('sinon');

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
    s.http.close();
    idamExpressMiddleware.authenticate.restore();
  });


  describe('success', () => {
    it('should immediately redirect to the has marriage broken step page if authenticated', done => {
      const context = {};

      testRedirect(done, agent, underTest, context,
        s.steps.ScreeningQuestionsMarriageBroken);
    });
  });
});

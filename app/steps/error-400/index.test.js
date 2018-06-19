const request = require('supertest');
const { testContent, testHttpStatus } = require('test/util/assertions');
const server = require('app');
const statusCodes = require('http-status-codes');

const modulePath = 'app/steps/error-400';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.Error400;
  });

  describe('success', () => {
    const session = {};

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });

    it('checks correct http status is used', done => {
      testHttpStatus(done, agent, underTest, statusCodes.BAD_REQUEST);
    });
  });
});

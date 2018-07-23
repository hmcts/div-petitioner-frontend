const request = require('supertest');
const server = require('app');
const { testContent } = require('test/util/assertions');

const modulePath = 'app/steps/application-submitted-awaiting-response';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.ApplicationSubmittedAwaitingResponse;
  });

  describe('success', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });
  });
});
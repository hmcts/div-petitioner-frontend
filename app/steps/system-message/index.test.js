const request = require('supertest');
const { testContent, testNoCYATemplate } = require('test/util/assertions');
const server = require('app');

const modulePath = 'app/steps/system-message';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.SystemMessage;
  });

  describe('success', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });
  });

  describe('Check Your Answers', () => {
    it('does not render the cya template', done => {
      testNoCYATemplate(done, underTest);
    });
  });
});

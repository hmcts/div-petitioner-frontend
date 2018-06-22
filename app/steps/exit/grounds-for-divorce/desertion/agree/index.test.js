const request = require('supertest');
const server = require('app');
const { testContent } = require('test/util/assertions');
const { withSession } = require('test/util/setup');

const modulePath = 'app/steps/exit/grounds-for-divorce/desertion/agree';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.ExitDesertionAgree;
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'husband' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });
  });
});

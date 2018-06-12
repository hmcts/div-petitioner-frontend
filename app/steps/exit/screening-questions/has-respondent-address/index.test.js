const request = require('supertest');
const { testContent } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');

const modulePath = 'app/steps/exit/screening-questions/has-respondent-address';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.ExitRespondentAddress;
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });
  });
});

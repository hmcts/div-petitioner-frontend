const request = require('supertest');
const { testContent, testRedirect } = require('test/util/assertions');
const server = require('app');

const modulePath = 'app/steps/application-submitted';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.ApplicationSubmitted;
  });


  afterEach(() => {
    s.http.close();
  });


  describe('success', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });

    it('redirects to the next page', done => {
      testRedirect(done, agent, underTest, {},
        s.steps.PayOnline);
    });
  });
});

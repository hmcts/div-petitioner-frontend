const request = require('supertest');
const { expect, sinon } = require('test/util/chai');
const { testContent } = require('test/util/assertions');
const server = require('app');

const modulePath = 'app/steps/save-resume/removed-saved-application';

const content = require(`${modulePath}/content`);
const Step = require(modulePath);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  const req = {};
  const res = {};
  let step = {};

  beforeEach(() => {
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.ExitRemovedSavedApplication;
    step = new Step();
    res.clearCookie = sinon.spy();
  });

  it('clears the connect.sid cookie', () => {
    // Act.
    step.handler(req, res);
    // Assert.
    expect(res.clearCookie.calledWith('connect.sid'));
  });

  afterEach(() => {
    s.http.close();
  });


  describe('success', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });
  });
});

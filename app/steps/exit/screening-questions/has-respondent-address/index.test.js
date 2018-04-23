const request = require('supertest');
const { expect, sinon } = require('test/util/chai');
const { testContent } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');

const modulePath = 'app/steps/exit/screening-questions/has-respondent-address';

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
    underTest = s.steps.ExitRespondentAddress;
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

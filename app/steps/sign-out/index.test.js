/* eslint-disable max-nested-callbacks, no-undefined */
const request = require('supertest');
const clone = require('lodash').cloneDeep;
const { expect } = require('test/util/chai');
const { withSession } = require('test/util/setup');
const { mockSession } = require('test/fixtures');
const { expectSessionValue, postData, testRedirect } = require('test/util/assertions');
const idamMock = require('test/mocks/idam');
const server = require('app');

const modulePath = 'app/steps/sign-out';

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.SignOut;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    beforeEach(done => {
      const session = clone(mockSession);
      withSession(done, agent, session);
    });

    it('should immediately redirect to the index page and clear the session', done => {
      const context = {};

      testRedirect(done, agent, underTest, context,
        s.steps.Index);
    });

    it('should clear the session', done => {
      const context = {};

      agent.get('/session').then(response => {
        expect(response.body.divorceWho).to.not.equal(undefined);

        postData(agent, underTest.url, context).then(() => {
          expectSessionValue('divorceWho', undefined, agent, done)();
        });
      })
        .catch(error => {
          done(error);
        });
    });
  });
});

/* eslint-disable no-undefined */
const request = require('supertest');
const httpStatus = require('http-status-codes');
const clone = require('lodash').cloneDeep;
const { expect } = require('test/util/chai');
const { withSession } = require('test/util/setup');
const { mockSession } = require('test/fixtures');
const idamMock = require('test/mocks/idam');
const idamExpress = require('@hmcts/div-idam-express-middleware');
const CONF = require('config');
const parseBool = require('app/core/utils/parseBool');

const server = require('app');

describe('Sign out route', () => {
  let s = {};
  let agent = {};

  beforeEach(done => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);

    withSession(done, agent, clone(mockSession));
  });

  afterEach(() => {
    idamMock.restore();
  });

  it('should redirect to index and delete the session', done => {
    agent.get('/session').then(response => {
      expect(response.body.divorceWho).to.not.equal(undefined);
    })
      .catch(error => {
        done(error);
      });

    agent.get('/sign-out')
      .expect(httpStatus.MOVED_TEMPORARILY)
      .expect('location', '/index')
      .end(() => {
        if (parseBool(CONF.features.idam)) {
          expect(idamExpress.logout.called).to.equal(true);
        }
        agent.get('/session').then(response => {
          expect(response.body.divorceWho).to.equal(undefined);
          done();
        })
          .catch(error => {
            done(error);
          });
      });
  });
});
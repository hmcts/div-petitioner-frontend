const { expect, sinon } = require('test/util/chai');
const draftPetitionStoreMiddleware = require('./draftPetitionStoreMiddleware');
const { noop } = require('lodash');
const config = require('config');

const modulePath = 'app/middleware/sessionTimeout';
const sessionTimeout = require(modulePath);

const ONE_SECOND = 1000;
const HALF_A_SECOND = 500;

describe(modulePath, () => {
  it('allows save only session calls after session expiry', () => {
    const sandbox = sinon.sandbox.create();
    sandbox.useFakeTimers(ONE_SECOND);
    sandbox.stub(draftPetitionStoreMiddleware, 'saveSessionToDraftStoreAndReply');

    const req = {
      session: { expires: HALF_A_SECOND },
      originalUrl: '/',
      headers: { 'x-save-draft-session-only': true }
    };
    const res = {};
    const next = sandbox.stub();

    sessionTimeout(req, res, next);

    expect(draftPetitionStoreMiddleware.saveSessionToDraftStoreAndReply.args)
      .to.deep.equal([[ req, res, next ]]);

    expect(next.callCount)
      .to.equal(0);

    sandbox.restore();
  });

  it('saves session and redirects to /timeout when session is expired', () => {
    const sandbox = sinon.sandbox.create();
    sandbox.useFakeTimers(ONE_SECOND);
    sandbox.stub(draftPetitionStoreMiddleware, 'saveSessionToDraftStore');

    const req = {
      session: { expires: HALF_A_SECOND },
      originalUrl: '/',
      headers: {},
      method: 'get',
      body: { foo: 'value' }
    };
    const res = { redirect: sandbox.stub() };
    const next = sandbox.stub();
    const step = { properties: { foo: '' } };

    const expectedRequestSesssion = Object.assign({}, req.session, req.body);

    sessionTimeout.call(step, req, res, next);

    expect(draftPetitionStoreMiddleware.saveSessionToDraftStore.args)
      .to.deep.equal([[ req, res, noop ]]);

    expect(req.session)
      .to.deep.equal(expectedRequestSesssion);

    expect(next.callCount)
      .to.equal(0);

    sandbox.restore();
  });

  it('updates active sessions', () => {
    const sandbox = sinon.sandbox.create();
    sandbox.useFakeTimers(HALF_A_SECOND);

    const req = {
      session: { expires: ONE_SECOND },
      originalUrl: '/'
    };
    const res = {};
    const next = sandbox.stub();

    const expectedNewSessionExpiry = HALF_A_SECOND + config.session.expires;

    sessionTimeout(req, res, next);

    expect(req.session.expires)
      .to.equal(expectedNewSessionExpiry);

    expect(next.callCount)
      .to.equal(1);

    sandbox.restore();
  });

  it('does not update session for restricted paths', () => {
    const sandbox = sinon.sandbox.create();
    sandbox.useFakeTimers(HALF_A_SECOND);

    const req = {
      session: { expires: ONE_SECOND },
      originalUrl: '/timeout'
    };
    const res = {};
    const next = sandbox.stub();

    sessionTimeout(req, res, next);

    expect(req.session.expires)
      .to.equal(ONE_SECOND);

    expect(next.callCount)
      .to.equal(1);

    sandbox.restore();
  });
});

const { expect, sinon } = require('test/util/chai');
const nock = require('nock');
const CONF = require('config');
const httpStatus = require('http-status-codes');

const modulePath = 'app/middleware/completeEqualityTask';
const completeEqualityTask = require(modulePath);
const Equality = require('app/steps/equality/index');

const timoutMs = 100;

let params = {};

const testPcqSkipped = done => {
  setTimeout(() => {
    expect(params.next.calledOnce)
      .to
      .equal(false);
    expect(params.res.redirect.calledOnce)
      .to
      .equal(true);
    expect(params.res.redirect.calledWith(Equality.returnPath))
      .to
      .equal(true);
    done();
  }, timoutMs);
};

describe(modulePath, () => {
  const pcqHost = CONF.services.equalityAndDiversity.url;

  beforeEach(() => {
    params = {
      isEnabled: true,
      req: { session: {} },
      res: { redirect: sinon.stub() },
      next: sinon.stub()
    };
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('calls next if PCQ is enabled, pcqId is not set and PCQ is healthy', done => {
    nock(pcqHost)
      .get('/health')
      .reply(httpStatus.OK, { status: 'UP' });

    completeEqualityTask(params);

    setTimeout(() => {
      expect(params.next.calledOnce)
        .to
        .equal(true);
      expect(params.res.redirect.calledOnce)
        .to
        .equal(false);
      done();
    }, timoutMs);
  });

  it('skips PCQ if it\'s not enabled', done => {
    nock(pcqHost)
      .get('/health')
      .reply(httpStatus.OK, { status: 'UP' });

    params.isEnabled = false;

    completeEqualityTask(params);
    testPcqSkipped(done);
  });

  it('skips PCQ if the pcqId is already in session', done => {
    nock(pcqHost)
      .get('/health')
      .reply(httpStatus.OK, { status: 'UP' });

    params.req.session.petitionerPcqId = 'abc123';

    completeEqualityTask(params);
    testPcqSkipped(done);
  });

  it('skips PCQ if PCQ is unhealthy', done => {
    nock(pcqHost)
      .get('/health')
      .reply(httpStatus.OK, { status: 'DOWN' });

    completeEqualityTask(params);
    testPcqSkipped(done);
  });

  it('skips PCQ if there is an error retrieving the PCQ health', done => {
    completeEqualityTask(params);
    testPcqSkipped(done);
  });
});

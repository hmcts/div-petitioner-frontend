const { expect, sinon } = require('test/util/chai');
const rewire = require('rewire');
const CONF = require('config');
const mockFeeReigsterService = require('app/services/mocks/feeRegisterService');

const modulePath = 'app/middleware/updateApplicationFeeMiddleware';
const underTest = rewire(modulePath);

let req = {};
let res = {};
const ioRedisClient = {};

describe(modulePath, () => {
  describe('#updateApplicationFeeMiddleware', () => {
    beforeEach(() => {
      ioRedisClient.get = sinon.stub().resolves();
      ioRedisClient.set = sinon.stub().resolves();
      ioRedisClient.expire = sinon.stub().resolves();
      underTest.__set__('redisClient', ioRedisClient);
      req = { session: {} };
      res = { redirect: sinon.stub() };
    });
    it('gets application fee from fee register', done => {
      underTest.updateApplicationFeeMiddleware(req, res, () => {
        expect(ioRedisClient.get.calledOnce).to.eql(true);
        expect(ioRedisClient.set.calledOnce).to.eql(true);
        expect(ioRedisClient.expire.calledOnce).to.eql(true);
        expect(CONF.commonProps.applicationFee)
          .to.eql(mockFeeReigsterService.mockFeeResponse);
        done();
      });
    });
    it('gets application fee redis if available', done => {
      ioRedisClient.get = sinon.stub()
        .resolves(JSON.stringify(mockFeeReigsterService.mockFeeResponse));
      underTest.updateApplicationFeeMiddleware(req, res, () => {
        expect(ioRedisClient.get.calledOnce).to.eql(true);
        expect(ioRedisClient.set.calledOnce).to.eql(false);
        expect(ioRedisClient.expire.calledOnce).to.eql(false);
        expect(CONF.commonProps.applicationFee)
          .to.eql(mockFeeReigsterService.mockFeeResponse);
        done();
      });
    });
    it('catches error and redirects to res.redirect', done => {
      ioRedisClient.get = sinon.stub().rejects(new Error());
      const next = sinon.stub();
      underTest.updateApplicationFeeMiddleware(req, res, next);
      setImmediate(() => {
        expect(ioRedisClient.get.calledOnce).to.eql(true);
        expect(res.redirect.calledOnce).to.eql(true);
        expect(next.calledOnce).to.eql(false);
        expect(res.redirect.calledWith('/generic-error')).to.eql(true);
        done();
      });
    });
  });
});

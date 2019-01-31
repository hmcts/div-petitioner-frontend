const { expect, sinon } = require('test/util/chai');
const rewire = require('rewire');
const CONF = require('config');
const mockFeesAndPaymentsService = require('app/services/mocks/feesAndPaymentsService.js');

const modulePath = 'app/middleware/updateApplicationFeeMiddleware';
const underTest = rewire(modulePath);

let req = {};
let res = {};
const ioRedisClient = {};

describe(modulePath, () => {
  describe('#updateApplicationFeeMiddleware', () => {
    beforeEach(() => {
      ioRedisClient.get = sinon.stub().resolves();
      underTest.__set__('redisClient', ioRedisClient);
      req = { session: {} };
      res = { redirect: sinon.stub() };
    });
    it('gets application fee from fee register', done => {
      underTest.updateApplicationFeeMiddleware(req, res, () => {
        expect(ioRedisClient.get.calledOnce).to.eql(true);
        expect(CONF.commonProps.applicationFee)
          .to.eql(mockFeesAndPaymentsService.mockFeeResponse('applicationFee'));
        done();
      });
    });
    it('gets application fee redis if available', done => {
      ioRedisClient.get = sinon.stub()
        .resolves(JSON.stringify(mockFeesAndPaymentsService.mockFeeResponse));
      underTest.updateApplicationFeeMiddleware(req, res, () => {
        expect(ioRedisClient.get.calledWith('commonProps.applicationFee.amount')).to.eql(true);
        expect(CONF.commonProps.applicationFee)
          .to.eql(mockFeesAndPaymentsService.mockFeeResponse('applicationFee'));
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

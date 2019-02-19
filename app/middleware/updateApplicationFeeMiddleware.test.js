const { expect, sinon } = require('test/util/chai');
const rewire = require('rewire');
const CONF = require('config');
const mockFeesAndPaymentsService = require('app/services/mocks/feesAndPaymentsService.js');

const modulePath = 'app/middleware/updateApplicationFeeMiddleware';
const underTest = rewire(modulePath);

let req = {};
let res = {};
const ioRedisClient = {};
const twentyFourHours = 86400;

const feeTypes = {
  applicationFee: 'petition-issue-fee',
  amendFee: 'amend-fee'
};

describe(modulePath, () => {
  describe('#updateApplicationFeeMiddleware', () => {
    beforeEach(() => {
      ioRedisClient.get = sinon.stub().resolves();
      ioRedisClient.set = sinon.stub().resolves();
      underTest.__set__('redisClient', ioRedisClient);
      req = { session: {} };
      res = { redirect: sinon.stub() };
    });
    it('gets applicationFee from fee register and caches in redis', done => {
      underTest.updateApplicationFeeMiddleware(req, res, () => {
        expect(ioRedisClient.get.calledOnce).to.eql(true);
        expect(CONF.commonProps.applicationFee)
          .to.eql(
            mockFeesAndPaymentsService.mockFeeResponse(feeTypes.applicationFee)
          );
        expect(
          ioRedisClient.set.calledWith(
            'commonProps.applicationFee',
            JSON.stringify(
              mockFeesAndPaymentsService
                .mockFeeResponse(feeTypes.applicationFee)
            ),
            'EX',
            twentyFourHours
          )
        ).to.eql(true);
        done();
      });
    });
    it('gets application fee redis if available', done => {
      ioRedisClient.get = sinon.stub()
        .resolves(JSON.stringify(mockFeesAndPaymentsService.mockFeeResponse));
      underTest.updateApplicationFeeMiddleware(req, res, () => {
        expect(ioRedisClient.get.calledWith('commonProps.applicationFee')).to.eql(true);
        expect(CONF.commonProps.applicationFee)
          .to.eql(
            mockFeesAndPaymentsService.mockFeeResponse(feeTypes.applicationFee)
          );
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
  describe('#updateAmendFeeMiddleware', () => {
    beforeEach(() => {
      ioRedisClient.get = sinon.stub().resolves();
      ioRedisClient.set = sinon.stub().resolves();
      underTest.__set__('redisClient', ioRedisClient);
      req = { session: {} };
      res = { redirect: sinon.stub() };
    });
    it('gets amendFee from fee register and caches in redis', done => {
      underTest.updateAmendFeeMiddleware(req, res, () => {
        expect(ioRedisClient.get.calledOnce).to.eql(true);
        expect(CONF.commonProps.amendFee)
          .to.eql(
            mockFeesAndPaymentsService.mockFeeResponse(feeTypes.amendFee)
          );
        expect(
          ioRedisClient.set.calledWith(
            'commonProps.amendFee',
            JSON.stringify(
              mockFeesAndPaymentsService.mockFeeResponse(feeTypes.amendFee)
            ),
            'EX',
            twentyFourHours
          )
        ).to.eql(true);
        done();
      });
    });
    it('gets application fee redis if available', done => {
      ioRedisClient.get = sinon.stub()
        .resolves(
          JSON.stringify(
            mockFeesAndPaymentsService.mockFeeResponse(feeTypes.amendFee)
          )
        );
      underTest.updateAmendFeeMiddleware(req, res, () => {
        expect(ioRedisClient.get.calledWith('commonProps.amendFee')).to.eql(true);
        expect(CONF.commonProps.amendFee)
          .to.eql(
            mockFeesAndPaymentsService.mockFeeResponse(feeTypes.amendFee)
          );
        done();
      });
    });
    it('catches error and redirects to res.redirect', done => {
      ioRedisClient.get = sinon.stub().rejects(new Error());
      const next = sinon.stub();
      underTest.updateAmendFeeMiddleware(req, res, next);
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

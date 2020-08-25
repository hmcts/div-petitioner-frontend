const { expect, sinon } = require('test/util/chai');
const rewire = require('rewire');
const CONF = require('config');
const { feeTypes } = require('app/services/feesAndPaymentsService');
const mockFeesAndPaymentsService = require('app/services/mocks/feesAndPaymentsService');

const modulePath = 'app/middleware/updateApplicationFeeMiddleware';
const underTest = rewire(modulePath);

let req = {};
let res = {};
const ioRedisClient = {};
const twentyFourHours = 86400;

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

  describe('#updateAppWithoutNoticeFeeMiddleware', () => {
    beforeEach(() => {
      ioRedisClient.get = sinon.stub().resolves();
      ioRedisClient.set = sinon.stub().resolves();
      underTest.__set__('redisClient', ioRedisClient);
      req = { session: {} };
      res = { redirect: sinon.stub() };
    });
    it('gets appWithoutNoticeFee from fee register and caches in redis', done => {
      underTest.updateAppWithoutNoticeFeeMiddleware(req, res, () => {
        expect(ioRedisClient.get.calledOnce).to.eql(true);
        expect(CONF.commonProps.appWithoutNoticeFee)
          .to.eql(
            mockFeesAndPaymentsService.mockFeeResponse(feeTypes.appWithoutNoticeFee)
          );
        expect(
          ioRedisClient.set.calledWith(
            'commonProps.appWithoutNoticeFee',
            JSON.stringify(
              mockFeesAndPaymentsService.mockFeeResponse(feeTypes.appWithoutNoticeFee)
            ),
            'EX',
            twentyFourHours
          )
        ).to.eql(true);
        done();
      });
    });
    it('gets appWithoutNoticeFee fee redis if available', done => {
      ioRedisClient.get = sinon.stub()
        .resolves(
          JSON.stringify(
            mockFeesAndPaymentsService.mockFeeResponse(feeTypes.appWithoutNoticeFee)
          )
        );
      underTest.updateAppWithoutNoticeFeeMiddleware(req, res, () => {
        expect(ioRedisClient.get.calledWith('commonProps.appWithoutNoticeFee')).to.eql(true);
        expect(CONF.commonProps.appWithoutNoticeFee)
          .to.eql(
            mockFeesAndPaymentsService.mockFeeResponse(feeTypes.appWithoutNoticeFee)
          );
        done();
      });
    });
    it('catches appWithoutNoticeFee error and redirects to res.redirect', done => {
      ioRedisClient.get = sinon.stub().rejects(new Error());
      const next = sinon.stub();
      underTest.updateAppWithoutNoticeFeeMiddleware(req, res, next);
      setImmediate(() => {
        expect(ioRedisClient.get.calledOnce).to.eql(true);
        expect(res.redirect.calledOnce).to.eql(true);
        expect(next.calledOnce).to.eql(false);
        expect(res.redirect.calledWith('/generic-error')).to.eql(true);
        done();
      });
    });
  });

  describe('#updateEnforcementFeeMiddleware', () => {
    beforeEach(() => {
      ioRedisClient.get = sinon.stub().resolves();
      ioRedisClient.set = sinon.stub().resolves();
      underTest.__set__('redisClient', ioRedisClient);
      req = { session: {} };
      res = { redirect: sinon.stub() };
    });
    it('gets enforcementFee from fee register and caches in redis', done => {
      underTest.updateEnforcementFeeMiddleware(req, res, () => {
        expect(ioRedisClient.get.calledOnce).to.eql(true);
        expect(CONF.commonProps.enforcementFee)
          .to.eql(
            mockFeesAndPaymentsService.mockFeeResponse(feeTypes.enforcementFee)
          );
        expect(
          ioRedisClient.set.calledWith(
            'commonProps.enforcementFee',
            JSON.stringify(
              mockFeesAndPaymentsService.mockFeeResponse(feeTypes.enforcementFee)
            ),
            'EX',
            twentyFourHours
          )
        ).to.eql(true);
        done();
      });
    });
    it('gets enforcementFee fee redis if available', done => {
      ioRedisClient.get = sinon.stub()
        .resolves(
          JSON.stringify(
            mockFeesAndPaymentsService.mockFeeResponse(feeTypes.enforcementFee)
          )
        );
      underTest.updateEnforcementFeeMiddleware(req, res, () => {
        expect(ioRedisClient.get.calledWith('commonProps.enforcementFee')).to.eql(true);
        expect(CONF.commonProps.enforcementFee)
          .to.eql(
            mockFeesAndPaymentsService.mockFeeResponse(feeTypes.enforcementFee)
          );
        done();
      });
    });
    it('catches enforcementFee error and redirects to res.redirect', done => {
      ioRedisClient.get = sinon.stub().rejects(new Error());
      const next = sinon.stub();
      underTest.updateEnforcementFeeMiddleware(req, res, next);
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

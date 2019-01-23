const { expect, sinon } = require('test/util/chai');
const logging = require('@hmcts/nodejs-logging');

const modulePath = 'app/services/logger';
const logger = require(modulePath);

const idamUserId = 'idam.id';
const idam = { userDetails: { id: idamUserId } };
const logString = 'This is an error';
const tag = 'test';
let req = {};
let res = {};
let loggerStub = {};
let loggerInstance = {};

describe(modulePath, () => {
  describe('#accessLogger', () => {
    beforeEach(() => {
      loggerStub = {
        log: sinon.stub(),
        info: sinon.stub(),
        warn: sinon.stub(),
        error: sinon.stub()
      };
      req = {
        httpVersionMajor: 1,
        httpVersionMinor: 1,
        method: 'GET',
        url: 'url',
        idam
      };
      res = { statusCode: 200 };
      sinon.stub(logging.Express, 'accessLogger').returnsArg(0);
    });
    afterEach(() => {
      logging.Express.accessLogger.restore();
    });
    it('creates a message with the idam user id', () => {
      const accessLogger = logger.accessLogger();
      const message = accessLogger.formatter(req, res);
      expect(message).to.eql(`IDAM ID: ${idamUserId} - "GET url HTTP/1.1" 200`);
    });
    it('creates a message with the unkown if no idam', () => {
      delete req.idam;
      const accessLogger = logger.accessLogger();
      const message = accessLogger.formatter(req, res);
      expect(message).to.eql('IDAM ID: unknown - "GET url HTTP/1.1" 200');
    });
  });

  describe('#logger', () => {
    beforeEach(() => {
      loggerStub = {
        log: sinon.stub(),
        info: sinon.stub(),
        warn: sinon.stub(),
        error: sinon.stub()
      };
      req = { idam };
      sinon.stub(logging.Logger, 'getLogger').returns(loggerStub);
      loggerInstance = logger.logger('name');
    });

    afterEach(() => {
      logging.Logger.getLogger.restore();
    });

    it('creates logging instance with given name', () => {
      expect(logging.Logger.getLogger.calledWith('name')).to.eql(true);
      expect(logging.Logger.getLogger.calledOnce).to.eql(true);
    });

    it('calls logger log with arguments', () => {
      loggerInstance.log(req, tag, logString);
      expect(loggerStub.log.calledOnce).to.eql(true);
      expect(loggerStub.log.args[0][0]).to.eql(`IDAM ID: ${idamUserId}`);
      expect(loggerStub.log.args[0][1]).to.eql(tag);
      expect(loggerStub.log.args[0][2]).to.eql(logString);
    });

    it('calls logger info with arguments', () => {
      loggerInstance.info(logString);
      expect(loggerStub.info.calledOnce).to.eql(true);
    });

    it('calls logger warn with arguments', () => {
      loggerInstance.warn(logString);
      expect(loggerStub.warn.calledOnce).to.eql(true);
    });

    it('calls logger error with arguments', () => {
      loggerInstance.error(logString);
      expect(loggerStub.error.calledOnce).to.eql(true);
    });
  });
});

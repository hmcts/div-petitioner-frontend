const { expect, sinon } = require('test/util/chai');
const logging = require('@hmcts/nodejs-logging');

const modulePath = 'app/services/logger';
const logger = require(modulePath);

const idamUserId = 'idam.id';
const idam = { userDetails: { id: idamUserId } };
const logString = 'This is an error';
const errorStringWithUserId = `IDAM UID:${idamUserId} - This is an error`;
const errorStringWithUnknown = 'IDAM UID:unknown - This is an error';

let logError = {};
let logObject = {};
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
      sinon.stub(logging.express, 'accessLogger').returnsArg(0);
    });
    afterEach(() => {
      logging.express.accessLogger.restore();
    });
    it('creates a message with the idam user id', () => {
      const accessLogger = logger.accessLogger();
      const message = accessLogger.formatter(req, res);
      expect(message).to.eql(`IDAM UID:${idamUserId} - "GET url HTTP/1.1" 200`);
    });
    it('creates a message with the unkown if no idam', () => {
      delete req.idam;
      const accessLogger = logger.accessLogger();
      const message = accessLogger.formatter(req, res);
      expect(message).to.eql('IDAM UID:unknown - "GET url HTTP/1.1" 200');
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
      sinon.stub(logging, 'getLogger').returns(loggerStub);
      loggerInstance = logger.logger('name');
    });

    afterEach(() => {
      logging.getLogger.restore();
    });

    it('creates logging instance with given name', () => {
      expect(logging.getLogger.calledWith('name')).to.eql(true);
      expect(logging.getLogger.calledOnce).to.eql(true);
    });

    it('calls logger log with arguments', () => {
      loggerInstance.log(logString, req);
      expect(loggerStub.log.calledOnce).to.eql(true);
      expect(loggerStub.log.calledWith(errorStringWithUserId)).to.eql(true);
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

  describe('#idamUserIdFromReq', () => {
    it('returns user id if req is provided as an argument', () => {
      req = { idam };
      const uid = logger.idamUserIdFromReq(['', req]);
      expect(uid).to.eql(idamUserId);
    });
    it('returns user id if req is provided anywhere in arguments', () => {
      req = { idam };
      const uid = logger.idamUserIdFromReq([req, [], {}]);
      expect(uid).to.eql(idamUserId);
    });
    it('returns unknown if req not provided', () => {
      const uid = logger.idamUserIdFromReq(['']);
      expect(uid).to.eql('unknown');
    });
    it('returns unknown id if req is provided but no idam is not', () => {
      req = {};
      const uid = logger.idamUserIdFromReq(['', req]);
      expect(uid).to.eql('unknown');
    });
  });

  describe('#addUserIdToMessage', () => {
    beforeEach(() => {
      logError = new Error(logString);
      logObject = { message: logString };
    });
    it('adds the user id from a string message', () => {
      req = { idam };
      const returnedArgs = logger.addUserIdToMessage([logString, req]);
      expect(returnedArgs[0]).to.eql(errorStringWithUserId);
    });
    it('adds the user id from an error', () => {
      req = { idam };
      const returnedArgs = logger.addUserIdToMessage([logError, req]);
      expect(returnedArgs[0].message).to.eql(errorStringWithUserId);
    });
    it('adds the user id from a log object', () => {
      req = { idam };
      const returnedArgs = logger.addUserIdToMessage([logObject, req]);
      expect(returnedArgs[0].message).to.eql(errorStringWithUserId);
    });
    it('adds unknown from a string message', () => {
      req = {};
      const returnedArgs = logger.addUserIdToMessage([logString, req]);
      expect(returnedArgs[0]).to.eql(errorStringWithUnknown);
    });
    it('adds unknown from an error', () => {
      req = {};
      const returnedArgs = logger.addUserIdToMessage([logError, req]);
      expect(returnedArgs[0].message).to.eql(errorStringWithUnknown);
    });
    it('adds unknown from a log object', () => {
      req = {};
      const returnedArgs = logger.addUserIdToMessage([logObject, req]);
      expect(returnedArgs[0].message).to.eql(errorStringWithUnknown);
    });
  });
});

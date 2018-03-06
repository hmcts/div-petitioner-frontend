const { expect, sinon } = require('test/util/chai');
const superagent = require('superagent');
const httpStatus = require('http-status-codes');
const sinonStubPromise = require('sinon-stub-promise');
const errors = require('app/resources/errors');
const fileManagement = require('app/services/fileManagement');

sinonStubPromise(sinon);

const modulePath = 'app/services/evidenceManagmentService';

const evidenceManagmentService = require(modulePath);

describe(modulePath, () => {
  describe('#mockFileResponse', () => {
    it('generates a mock response', () => {
      const mockResponse = evidenceManagmentService.mockFileResponse();
      expect(mockResponse).to.be.an('array');
      expect(mockResponse[0].status).to.eql('OK');
    });
  });

  describe('#handleResponse', () => {
    let body = {},
      resolve = {},
      reject = {};

    beforeEach(() => {
      body = [{ status: 'OK' }];
      resolve = sinon.stub();
      reject = sinon.stub();
    });

    it('resolves with body if valid', () => {
      evidenceManagmentService.handleResponse(body, resolve, reject);
      expect(resolve.calledOnce).to.eql(true);
      expect(resolve.calledWith(body)).to.eql(true);
    });

    it('rejects with body if valid', () => {
      body = [{ status: 'BAD' }];
      evidenceManagmentService.handleResponse(body, resolve, reject);
      expect(reject.calledOnce).to.eql(true);
      expect(reject.calledWith()).to.eql(true);
    });

    it('rejects with body if contains error', () => {
      body = { error: 'true' };
      evidenceManagmentService.handleResponse(body, resolve, reject);
      expect(reject.calledOnce).to.eql(true);
      expect(reject.calledWith(body)).to.eql(true);
    });
  });

  describe('#sendFile', () => {
    const token = 'token';
    const b = 0x62;
    const buf = Buffer.from([b, b, b]);
    const superagentStub = {};
    let resp = {};

    beforeEach(() => {
      resp = {
        statusCode: httpStatus.OK,
        body: [{ status: 'OK' }]
      };
      superagentStub.set = sinon.stub().returns(superagentStub);
      superagentStub.attach = sinon.stub().returns(superagentStub);
      superagentStub.end = callBack => {
        return callBack(null, resp);
      };
      sinon.stub(superagent, 'post').returns(superagentStub);
      sinon.stub(fileManagement, 'removeFile');

      process.env.EVIDENCE_MANAGEMENT_CLIENT_API_URL = 'test';
    });

    afterEach(() => {
      delete process.env.EVIDENCE_MANAGEMENT_CLIENT_API_URL;
      superagent.post.restore();
      fileManagement.removeFile.restore();
    });

    it('posts file to successfully', done => {
      const file = 'some file';
      evidenceManagmentService.sendFile(file, { token })
        .then(() => {
          expect(fileManagement.removeFile.calledOnce).to.equal(true);
          expect(fileManagement.removeFile.calledWith(file)).to.equal(true);
          expect(superagent.post.calledOnce).to.equal(true);
          expect(superagentStub.set.called).to.equal(true);
          expect(superagentStub.attach.calledOnce).to.equal(true);
        })
        .then(done, done);
    });

    it('mocks the post if no env EVIDENCE_MANAGEMENT_CLIENT_API_URL set', done => {
      delete process.env.EVIDENCE_MANAGEMENT_CLIENT_API_URL;
      evidenceManagmentService.sendFile(token, buf)
        .then(() => {
          expect(superagent.post.called).to.equal(false);
        })
        .then(done, done);
    });

    it('rejects if returned status is not 200', () => {
      resp = {
        statusCode: httpStatus.BAD_REQUEST,
        body: 'BAD_REQUEST'
      };

      expect(evidenceManagmentService.sendFile(token, buf))
        .to.be.rejectedWith(resp.body);
    });

    it('returns fileTypeInvalid error if file is rejected with type', done => {
      resp = {
        statusCode: httpStatus.BAD_REQUEST,
        errorCode: 'invalidFileType'
      };

      expect(evidenceManagmentService.sendFile(token, buf))
        .to.be.rejectedWith(errors.fileTypeInvalid)
        .and.notify(done);
    });
  });
});

/* eslint-disable max-nested-callbacks */
const { expect, sinon } = require('test/util/chai');
const sinonStubPromise = require('sinon-stub-promise');
const evidenceManagmentService = require('app/services/evidenceManagmentService');
const httpStatus = require('http-status-codes');
const fileManagement = require('app/services/fileManagement');

sinonStubPromise(sinon);

const modulePath = 'app/middleware/evidenceManagmentMiddleware';

const evidenceManagmentMiddleware = require(modulePath);

const nameSpace = 'test';

describe(modulePath, () => {
  describe('#createHandler', () => {
    let req = {},
      res = {},
      next = {},
      expressHandler = {};

    it('returns express handler', () => {
      expressHandler = evidenceManagmentMiddleware.createHandler(nameSpace);
      expect(typeof expressHandler).to.eql('function');
    });

    beforeEach(() => {
      next = sinon.stub();
      req = {
        cookies: '',
        method: 'get',
        session: { reload: sinon.stub().callsArgWith(0, null) },
        query: {},
        headers: { 'content-type': 'multipart/form-data' }
      };
      res = {
        redirect: sinon.stub(),
        send: sinon.stub()
      };
      res.status = sinon.stub().returns(res);
      expressHandler = evidenceManagmentMiddleware.createHandler(nameSpace);

      sinon.stub(fileManagement, 'saveFileFromRequest').resolves({});
      sinon.stub(evidenceManagmentService, 'sendFile').resolves([{ fileUrl: 'file' }]);
    });

    afterEach(() => {
      fileManagement.saveFileFromRequest.restore();
      evidenceManagmentService.sendFile.restore();
    });

    describe('orchestrates removing file', () => {
      it('with js', done => {
        req.method = 'delete';
        req.query = { js: true, fileUrl: 'file' };
        req.session[nameSpace] = [{ fileUrl: 'file' }];
        expressHandler(req, res, next)
          .then(() => {
            expect(req.session[nameSpace].length).to.eql(0);
            expect(res.status.calledOnce).to.eql(true);
            expect(res.send.calledOnce).to.eql(true);
          })
          .then(done, done);
      });
      it('without js', done => {
        req.method = 'delete';
        req.query = { fileUrl: 'file' };
        req.session[nameSpace] = [{ fileUrl: 'file' }];
        expressHandler(req, res, next)
          .then(() => {
            expect(req.session[nameSpace].length).to.eql(0);
            expect(res.redirect.calledOnce).to.eql(true);
          })
          .then(done, done);
      });
    });

    describe('orchestrates posting a file', () => {
      it('should run all functions', done => {
        req.method = 'post';
        expressHandler(req, res, next)
          .then(() => {
            expect(evidenceManagmentService.sendFile.calledOnce)
              .to.eql(true);
            expect(fileManagement.saveFileFromRequest.calledOnce)
              .to.eql(true);
            expect(req.session[nameSpace].length).to.eql(1);
            expect(res.redirect.calledOnce).to.eql(true);
          })
          .then(done, done);
      });
      it('should return 200 if JS request', done => {
        req.method = 'post';
        req.query.js = true;
        expressHandler(req, res, next)
          .then(() => {
            expect(evidenceManagmentService.sendFile.calledOnce)
              .to.eql(true);
            expect(res.status.calledOnce).to.eql(true);
            expect(res.status.calledWith(httpStatus.OK)).to.eql(true);
            expect(res.send.calledOnce).to.eql(true);
          })
          .then(done, done);
      });
      it('should redirect if non-js request', done => {
        req.method = 'post';
        expressHandler(req, res, next)
          .then(() => {
            expect(res.redirect.calledOnce).to.eql(true);
          })
          .then(done, done);
      });
      it('should handle error', done => {
        req.method = 'post';
        req.query.js = true;
        evidenceManagmentService.sendFile.restore();
        sinon.stub(evidenceManagmentService, 'sendFile').rejects();
        expressHandler(req, res, next)
          .then(() => {
            expect(res.status.calledOnce).to.eql(true);
            expect(res.status.calledWith(
              evidenceManagmentMiddleware.errors.unknown.status
            )).to.eql(true);
            expect(res.send.calledOnce).to.eql(true);
            expect(res.send.calledWith(
              evidenceManagmentMiddleware.errors.unknown
            )).to.eql(true);
          })
          .then(done, done);
      });
      it('should return unknown error', done => {
        req.method = 'post';
        req.query.js = true;
        evidenceManagmentService.sendFile.restore();
        sinon.stub(evidenceManagmentService, 'sendFile').rejects({ status: httpStatus.INTERNAL_SERVER_ERROR });
        expressHandler(req, res, next)
          .then(() => {
            expect(res.status.calledOnce).to.eql(true);
            expect(res.status.calledWith(
              evidenceManagmentMiddleware.errors.unknown.status
            )).to.eql(true);
            expect(res.send.calledOnce).to.eql(true);
            expect(res.send.calledWith(
              evidenceManagmentMiddleware.errors.unknown
            )).to.eql(true);
          })
          .then(done, done);
      });
    });

    describe('submit', () => {
      it('should call next if submit button pressed', () => {
        req.body = { submit: true };
        expressHandler(req, res, next);
        expect(next.calledOnce).to.eql(true);
      });
    });
    describe('default', () => {
      it('should call next not delete or post or submit button pressed', () => {
        req.method = 'get';
        expressHandler(req, res, next);
        expect(next.calledOnce).to.eql(true);
      });
    });
  });

  describe('#errorHandler', () => {
    const req = {},
      res = {};
    let next = {};
    beforeEach(() => {
      req.query = {};
      req.session = { reload: sinon.stub().callsArgWith(0, null) };
      res.redirect = sinon.stub();
      res.send = sinon.stub();
      res.status = sinon.stub().returns(res);
      next = sinon.stub();
    });
    it('should default to unknown error if we dont know it', () => {
      req.query.js = true;
      evidenceManagmentMiddleware.errorHandler({ code: 'an unknown error' }, req, res, next);
      expect(res.status.calledOnce).to.eql(true);
      expect(res.send.calledWith(evidenceManagmentMiddleware.errors.unknown))
        .to.eql(true);
    });
    it('return status code and message if js request', () => {
      req.query.js = true;
      evidenceManagmentMiddleware.errorHandler(
        evidenceManagmentMiddleware.errors.maximumFilesExceeded,
        req,
        res,
        next
      );
      expect(res.status.calledOnce).to.eql(true);
      expect(res.send.calledOnce).to.eql(true);
    });
    it('set error invalid in session if non-js reqest', () => {
      evidenceManagmentMiddleware.errorHandler(
        evidenceManagmentMiddleware.errors.fileTypeInvalid,
        req,
        res,
        next
      );
      expect(req.session[evidenceManagmentMiddleware.errors.fileTypeInvalid.code]).to.eql('invalid');
      expect(next.calledOnce).to.eql(true);
    });
  });

  describe('#handleResponseFromFileStore', () => {
    const req = {};
    const res = {};
    const two = 2;
    beforeEach(() => {
      req.session = { reload: sinon.stub().callsArgWith(0, null) };
    });
    it('should add new files if none exists', done => {
      const files = [{ name: 'file' }];
      evidenceManagmentMiddleware
        .handleResponseFromFileStore(req, res, files, nameSpace)
        .then(() => {
          expect(req.session[nameSpace].length).to.eql(1);
          expect(req.session[nameSpace][0]).to.eql(files[0]);
        })
        .then(done, done);
    });
    it('should add new files if none exists', done => {
      const files = [{ name: 'file2' }];
      req.session[nameSpace] = [{ name: 'file1' }];
      evidenceManagmentMiddleware
        .handleResponseFromFileStore(req, res, files, nameSpace)
        .then(() => {
          expect(req.session[nameSpace].length).to.eql(two);
          expect(req.session[nameSpace][1]).to.eql(files[0]);
        })
        .then(done, done);
    });
  });

  describe('#resetAllErrors', () => {
    it('remove all errors from session', () => {
      const req = {
        session: {
          errorMaximumFilesExceeded: 'invalid',
          errorFileTypeInvalid: 'invalid'
        }
      };
      evidenceManagmentMiddleware.resetAllErrors(req);
      expect(req.session).to.eql({});
    });
  });

  describe('#validatePostRequest', () => {
    it('should return error if files are more than 10', done => {
      const req = { session: {} };
      req.session[nameSpace] = [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {} ];

      expect(evidenceManagmentMiddleware.validatePostRequest(req, nameSpace))
        .to
        .be
        .rejectedWith(evidenceManagmentMiddleware.errors.maximumFilesExceeded)
        .and.notify(done);
    });
    it('should return ok if files less than 10', done => {
      const req = { session: { reload: sinon.stub().callsArgWith(0, null) } };
      req.session[nameSpace] = [ {}, {} ];

      evidenceManagmentMiddleware.validatePostRequest(req, nameSpace)
        .then(result => {
          expect(result).to.eql(req);
        })
        .then(done, done);
    });
  });

  describe('#removeFile', () => {
    const file1 = 'file uploaded 1';
    const file2 = 'file uploaded 2';

    it('removes files from session', done => {
      const req = {
        query: { fileUrl: file1 },
        session: { reload: sinon.stub().callsArgWith(0, null) }
      };
      const res = {};
      req.session[nameSpace] = [
        { fileName: file1, fileUrl: file1 },
        { fileName: file2, fileUrl: file2 }
      ];
      evidenceManagmentMiddleware.removeFile(req, res, nameSpace)
        .then(() => {
          expect(req.session[nameSpace]).to
            .eql([{ fileName: file2, fileUrl: file2 }]);
        })
        .then(done, done);
    });
  });
});
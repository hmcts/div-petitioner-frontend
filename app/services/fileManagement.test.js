const fs = require('fs');
const tmp = require('tmp');
const formidable = require('formidable');
const { expect, sinon } = require('test/util/chai');
const sinonStubPromise = require('sinon-stub-promise');
const util = require('util');

sinonStubPromise(sinon);

const modulePath = 'app/services/fileManagement';

const fileManagementService = require(modulePath);

describe(modulePath, () => {
  describe('#removeFile', () => {
    let unlink = null;
    let file = null;

    beforeEach(() => {
      file = { path: 'some path' };
      unlink = sinon.stub().resolves();
      sinon.stub(util, 'promisify').returns(unlink);
    });

    afterEach(() => {
      util.promisify.restore();
    });

    it('calls unlink', done => {
      fileManagementService.removeFile(file)
        .then(() => {
          expect(unlink.calledOnce).to.equal(true);
          expect(unlink.calledWith(file.path));
        })
        .then(done, done);
    });

    it('rejects', done => {
      const error = new Error('foo');
      unlink.rejects(error);
      expect(fileManagementService.removeFile(file))
        .to.be.rejectedWith(error)
        .and.notify(done);
    });
  });

  describe('#saveFileFromBuffer', () => {
    const path = 'some path';
    const fileName = 'some filename';
    const two = 2;

    beforeEach(() => {
      sinon.stub(tmp, 'file').callsArgWith(0, null, path);
      sinon.stub(fs, 'writeFile').callsArgWith(two, null);
    });

    afterEach(() => {
      tmp.file.restore();
      fs.writeFile.restore();
    });

    it('resolves with file path', done => {
      fileManagementService.saveFileFromBuffer(null, fileName)
        .then(generatedPath => {
          expect(tmp.file.calledOnce).to.equal(true);
          expect(fs.writeFile.calledOnce).to.equal(true);
          expect(generatedPath).to.eql({ path, name: fileName });
        })
        .then(done, done);
    });

    it('rejects when tempfile cannot be created', done => {
      const error = new Error('cannot create file');
      tmp.file.callsArgWith(0, error);

      expect(fileManagementService.saveFileFromBuffer())
        .to.be.rejectedWith(error)
        .and.notify(done);
    });

    it('rejects when tempfile cannot be written to the file system', done => {
      const error = new Error('cannot write file');
      fs.writeFile.callsArgWith(two, error);

      expect(fileManagementService.saveFileFromBuffer())
        .to.be.rejectedWith(error)
        .and.notify(done);
    });
  });

  describe('#saveFileFromRequest', () => {
    const fields = null;
    let error = null;
    let files = null;

    beforeEach(() => {
      const form = {
        parse: (req, georgeTheCallback) => {
          georgeTheCallback(error, fields, files);
        }
      };
      sinon.stub(formidable, 'IncomingForm').returns(form);
    });

    afterEach(() => {
      formidable.IncomingForm.restore();
    });

    it('resolves with file', done => {
      files = { file: 'some file' };
      fileManagementService.saveFileFromRequest()
        .then(returnedFile => {
          expect(files.file).to.eql(returnedFile);
        })
        .then(done, done);
    });

    it('rejects when unable to pass request', done => {
      error = new Error('some error');
      expect(fileManagementService.saveFileFromRequest())
        .to.be.rejectedWith(error)
        .and.notify(done);
    });
  });
});

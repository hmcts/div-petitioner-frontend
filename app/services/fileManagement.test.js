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
      fileManagementService.removeFile({}, file)
        .then(() => {
          expect(unlink.calledOnce).to.equal(true);
          expect(unlink.calledWith(file.path));
        })
        .then(done, done);
    });

    it('rejects', done => {
      const error = new Error('foo');
      unlink.rejects(error);
      expect(fileManagementService.removeFile({}, file))
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

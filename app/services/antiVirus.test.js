const { expect, sinon } = require('test/util/chai');
const clamAv = require('clam-engine');
const sinonStubPromise = require('sinon-stub-promise');
const errors = require('app/resources/errors');
const fileManagement = require('app/services/fileManagement');

sinonStubPromise(sinon);

const modulePath = 'app/services/antiVirus';

const antiVirus = require(modulePath);

const file = {
  name: 'image.jpg',
  path: 'path/to/file/image.jpg'
};
const currentEMCApiUrl = process.env.EVIDENCE_MANAGEMENT_CLIENT_API_URL;

describe(modulePath, () => {
  beforeEach(() => {
    process.env.EVIDENCE_MANAGEMENT_CLIENT_API_URL = 'test';
  });
  afterEach(() => {
    process.env.EVIDENCE_MANAGEMENT_CLIENT_API_URL = currentEMCApiUrl;
  });

  describe('#createEngine', () => {
    const engine = 'engine';
    afterEach(() => {
      clamAv.createEngine.restore();
    });
    it('creates and engine from clamAv', done => {
      sinon.stub(clamAv, 'createEngine').callsArgWith(0, null, engine);
      antiVirus.createEngine()
        .then(result => {
          expect(result).to.equal(engine);
        })
        .then(done, done);
    });
    it('throws error if cannot create engine', () => {
      sinon.stub(clamAv, 'createEngine').callsArgWith(0, 'Error creating engine');
      expect(antiVirus.createEngine())
        .to.be.rejectedWith('Error creating engine');
    });
  });

  describe('#scanFile', () => {
    const engine = {};
    beforeEach(() => {
      sinon.stub(fileManagement, 'removeFile');
      engine.scanFile = (filePath, theCallback) => {
        return theCallback();
      };
    });

    afterEach(() => {
      fileManagement.removeFile.restore();
    });

    it('resolves if file has no virus and no errors occurred', done => {
      expect(antiVirus.scanFile(engine, file))
        .to.become(file).and.notify(done);
    });

    it('throws error if scanning file failed', done => {
      engine.scanFile = (filePath, theCallback) => {
        const error = new Error('Error when scanning file');
        return theCallback(error);
      };
      expect(antiVirus.scanFile(engine, file))
        .to.be.rejectedWith('Error when scanning file')
        .and.notify(done);
    });

    it('throws error if scanning file failed', done => {
      engine.scanFile = (filePath, theCallback) => {
        const virusError = new Error('Virus detected');
        return theCallback(null, virusError);
      };
      expect(antiVirus.scanFile(engine, file))
        .to.be.rejectedWith(errors.virusFoundInFile)
        .and.notify(done);
    });

    it('deletes files if scanFile() rejects', done => {
      engine.scanFile = (filePath, theCallback) => {
        const virusError = new Error('Virus detected');
        return theCallback(null, virusError);
      };
      antiVirus.scanFile(engine, file)
        .catch(() => {
          expect(fileManagement.removeFile.calledOnce).to.equal(true);
          expect(fileManagement.removeFile.calledWith(file)).to.equal(true);
          done();
        });
    });
  });

  describe('#scan', () => {
    const engine = {};
    before(() => {
      engine.scanFile = sinon.stub().resolves();
      sinon.stub(clamAv, 'createEngine').callsArgWith(0, null, engine);
    });
    after(() => {
      clamAv.createEngine.restore();
    });
    it('should run #createEngine', () => {
      antiVirus.scan(file);
      expect(clamAv.createEngine.calledOnce)
        .to.eql(true);
    });
    it('should run #scanFile', () => {
      antiVirus.scan(file);
      expect(engine.scanFile.calledOnce)
        .to.eql(true);
    });
    it('return file if EVIDENCE_MANAGEMENT_CLIENT_API_URL not set', () => {
      delete process.env.EVIDENCE_MANAGEMENT_CLIENT_API_URL;
      const fileResponse = antiVirus.scan(file);
      expect(file).to.eql(fileResponse);
    });
  });
});

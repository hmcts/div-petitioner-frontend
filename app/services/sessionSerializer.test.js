const { expect, sinon } = require('test/util/chai');
const crypto = require('crypto');

const modulePath = 'app/services/sessionSerializer';
const sessionSerializer = require(modulePath);

let req = {};
let res = {};
const session = {};
const sessionStringified = JSON.stringify(session);
const passwordHash = crypto.createHash('md5')
  .update('top-secret', 'utf-8')
  .digest('hex')
  .toUpperCase();

describe(modulePath, () => {
  beforeEach(() => {
    res = { clearCookie: sinon.stub() };
    req = { cookies: { '__auth-token': 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjEyMzQ1Njc4OTAiLCJpZCI6IjEwIn0.sX3u4V8vPF6brlIfF6-k5JxZNI_Yjz__kfHnG9MyOu4' } };
  });

  describe('#createSerializer', () => {
    it('should return a serializer with parse and stringify functions', () => {
      const serializer = sessionSerializer.createSerializer(req);
      expect(serializer.hasOwnProperty('parse')).to.eql(true);
      expect(serializer.hasOwnProperty('stringify')).to.eql(true);
    });

    it('should throw an error if unable to create password hash', () => {
      req = { cookies: { '__auth-token': 'bad.token' } };
      expect(() => {
        return sessionSerializer.createSerializer(req, res);
      }).to.throw('Cannot read property \'id\' of null');
    });

    describe('#stringify', () => {
      it('returns an object stringified', () => {
        const serializer = sessionSerializer.createSerializer(req, res);
        const encryptedData = serializer.stringify(session);
        const parsedData = JSON.parse(encryptedData);
        expect(parsedData.hasOwnProperty('iv')).to.eql(true);
        expect(parsedData.hasOwnProperty('encryptedSession')).to.eql(true);
      });
    });

    describe('#parse', () => {
      it('returns an object stringified', () => {
        const serializer = sessionSerializer.createSerializer(req, res);
        const encryptedData = serializer.stringify(session);
        const decryptedData = serializer.parse(encryptedData);
        expect(decryptedData).to.eql(session);
      });
    });
  });

  describe('#encryptData', () => {
    it('returns object with string if no passwordHash supplied', () => {
      const encryptedData = sessionSerializer.encryptData(session);
      expect(encryptedData).to.eql({ string: session });
    });

    it('returns object with string if no passwordHash supplied', () => {
      const encryptedData = sessionSerializer
        .encryptData(sessionStringified, passwordHash);
      expect(encryptedData.hasOwnProperty('encryptedSession')).to.eql(true);
      expect(encryptedData.hasOwnProperty('iv')).to.eql(true);
    });

    it('throws error if not able to encrypt', () => {
      expect(() => {
        return sessionSerializer.encryptData(session, passwordHash);
      }).to.throw('Cipher data must be a string or a buffer');
    });
  });

  describe('#decryptData', () => {
    let defaultSessionString = null;

    beforeEach(() => {
      defaultSessionString = JSON.stringify({ cookie: { expires: null } });
    });

    it('returns default string if no passwordHash', () => {
      const encryptedData = sessionSerializer
        .encryptData(sessionStringified, passwordHash);
      const string = sessionSerializer.decryptData(encryptedData);
      expect(string).to.equal(defaultSessionString);
    });

    it('returns string object if no passwordHash', () => {
      const string = sessionSerializer
        .decryptData({ string: sessionStringified });
      expect(string).to.eql(sessionStringified);
    });

    it('returns default string if no iv supplied', () => {
      const string = sessionSerializer.decryptData({ encryptedSession: 'test' });
      expect(string).to.equal(defaultSessionString);
    });

    it('returns default string if no encryptedSession supplied', () => {
      const string = sessionSerializer.decryptData({ iv: 'test' });
      expect(string).to.equal(defaultSessionString);
    });

    it('returns decryptData', () => {
      const encryptedData = sessionSerializer
        .encryptData(sessionStringified, passwordHash);
      const string = sessionSerializer.decryptData(encryptedData, passwordHash);
      expect(string).to.eql(sessionStringified);
    });

    it('throws error if not able to encrypt', () => {
      const encryptedData = sessionSerializer
        .encryptData(sessionStringified, passwordHash);
      expect(() => {
        return sessionSerializer
          .decryptData(encryptedData, passwordHash.split(0, 1));
      }).to.throw('Key must be a buffer');
    });
  });
});

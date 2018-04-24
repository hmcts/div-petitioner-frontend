const { expect, sinon } = require('test/util/chai');
const sessionSerializer = require('app/services/sessionSerializer');

const modulePath = 'app/middleware/sessions';
const sessions = require(modulePath);

let req = {};
let res = {};
let next = {};
const serializer = {};
const prevNodeEnv = process.env.NODE_ENV;

describe(modulePath, () => {
  beforeEach(() => {
    delete process.env.NODE_ENV;
    req = {
      originalUrl: '/',
      headers: { },
      get: sinon.stub()
    };
    res = { redirect: sinon.stub() };
    sinon.stub(sessionSerializer, 'createSerializer').returns(serializer);
  });
  afterEach(() => {
    process.env.NODE_ENV = prevNodeEnv;
    sessionSerializer.createSerializer.restore();
  });

  describe('#prod', () => {
    it('should use memory if NODE_ENV is testing', done => {
      process.env.NODE_ENV = 'testing';
      const session = sessions.prod();
      next = () => {
        expect(req.sessionStore.constructor.name).to.eql('MemoryStore');
        done();
      };
      session(req, res, next);
    });

    it('should use redis if NODE_ENV is not testing', done => {
      const session = sessions.prod();
      next = () => {
        expect(req.sessionStore.constructor.name).to.eql('RedisStore');
        done();
      };
      session(req, res, next);
    });
  });

  describe('#redis', () => {
    it('should create a session using redis as store', done => {
      const session = sessions.redis();
      next = () => {
        expect(req.sessionStore.constructor.name).to.eql('RedisStore');
        done();
      };
      session(req, res, next);
    });
    it('should use the serializer generated from the sessionSerializer', done => {
      const session = sessions.redis();
      next = () => {
        expect(sessionSerializer.createSerializer.calledOnce).to.eql(true);
        done();
      };
      session(req, res, next);
    });
    it('should redirect to error page if an error occours when parsing the session', done => {
      sessionSerializer.createSerializer.restore();
      const error = Error('Unable to parse session');
      sinon.stub(sessionSerializer, 'createSerializer').throws(error);
      const session = sessions.redis();
      session(req, res);

      expect(sessionSerializer.createSerializer.calledOnce).to.eql(true);
      expect(res.redirect.calledOnce).to.eql(true);
      expect(res.redirect.calledWith('/generic-error')).to.eql(true);
      done();
    });
  });

  describe('#inmemory', () => {
    it('should create a session using memory as store', done => {
      const session = sessions.inmemory();
      next = () => {
        expect(req.sessionStore.constructor.name).to.eql('MemoryStore');
        done();
      };
      session(req, res, next);
    });
  });
});

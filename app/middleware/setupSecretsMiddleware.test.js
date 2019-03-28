const { expect, sinon } = require('test/util/chai');
const { cloneDeep } = require('lodash');
const config = require('config');
const proxyquire = require('proxyquire');

const modulePath = 'app/middleware/setupSecretsMiddleware';

const req = {};
const res = {};
let next = {};
let mockConfig = {};

describe(modulePath, () => {
  describe('#setup', () => {
    beforeEach(() => {
      next = sinon.stub();
      mockConfig = cloneDeep(config);
    });

    it('should set config values when secrets path is set', () => {
      mockConfig.secrets = {
        div: {
          'session-secret': 'sessionValue',
          'redis-secret': 'redisValue',
          'idam-secret': 'idamValue',
          'post-code-token': 'postCodeValue',
          'frontend-secret': 'frontendValue'
        }
      };

      // Update config with secret setup
      const setupSecretsMiddleware = proxyquire(modulePath,
        { config: mockConfig });
      setupSecretsMiddleware.setup(req, res, next);

      expect(mockConfig.secret)
        .to.equal(mockConfig.secrets.div['session-secret']);
      expect(mockConfig.sessionEncryptionSecret)
        .to.equal(mockConfig.secrets.div['redis-secret']);
      expect(mockConfig.idamArgs.idamSecret)
        .to.equal(mockConfig.secrets.div['idam-secret']);
      expect(mockConfig.services.postcodeInfo.token)
        .to.equal(mockConfig.secrets.div['post-code-token']);
      expect(mockConfig.services.serviceAuthProvider.microserviceKey)
        .to.equal(mockConfig.secrets.div['frontend-secret']);
      expect(next.calledOnce).to.eql(true);
    });

    it('should not set config values when secrets path is not set', () => {
      // Update config with secret setup
      const setupSecretsMiddleware = proxyquire(modulePath,
        { config: mockConfig });
      setupSecretsMiddleware.setup(req, res, next);

      expect(mockConfig.secret)
        .to.equal(config.secret);
      expect(mockConfig.sessionEncryptionSecret)
        .to.equal(config.sessionEncryptionSecret);
      expect(mockConfig.idamArgs.idamSecret)
        .to.equal(config.idamArgs.idamSecret);
      expect(mockConfig.services.postcodeInfo.token)
        .to.equal(config.services.postcodeInfo.token);
      expect(mockConfig.services.serviceAuthProvider.microserviceKey)
        .to.equal(config.services.serviceAuthProvider.microserviceKey);
      expect(next.calledOnce).to.eql(true);
    });

    it('should only set one config value when single secret path is set', () => {
      mockConfig.secrets = { div: { 'idam-secret': 'idamValue' } };

      // Update config with secret setup
      const setupSecretsMiddleware = proxyquire(modulePath,
        { config: mockConfig });
      setupSecretsMiddleware.setup(req, res, next);

      expect(mockConfig.secret)
        .to.equal(config.secret);
      expect(mockConfig.sessionEncryptionSecret)
        .to.equal(config.sessionEncryptionSecret);
      expect(mockConfig.idamArgs.idamSecret)
        .to.not.equal(config.idamArgs.idamSecret);
      expect(mockConfig.idamArgs.idamSecret)
        .to.equal(mockConfig.secrets.div['idam-secret']);
      expect(mockConfig.services.postcodeInfo.token)
        .to.equal(config.services.postcodeInfo.token);
      expect(mockConfig.services.serviceAuthProvider.microserviceKey)
        .to.equal(config.services.serviceAuthProvider.microserviceKey);
      expect(next.calledOnce).to.eql(true);
    });
  });
});
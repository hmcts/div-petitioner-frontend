const CONF = require('config');
const crypto = require('crypto');
const logger = require('app/services/logger').logger(__filename);
const idam = require('app/services/idam');

const sessionEncryptionSecret = CONF.sessionEncryptionSecret;
const algorithm = 'AES-256-CBC';
const ivLength = 16;
// Ensure that blank session data is compatible with express-session.
const defaultStringifiedJson = JSON.stringify({ cookie: { expires: null } });

const encryptData = (string = defaultStringifiedJson, passwordHash) => {
  if (!passwordHash) {
    return { string };
  }
  try {
    const iv = Buffer.from(crypto.randomBytes(ivLength));

    const cipher = crypto.createCipheriv(algorithm, passwordHash, iv);
    let encryptedSession = cipher.update(string, 'utf8', 'hex');
    encryptedSession += cipher.final('hex');

    return {
      encryptedSession,
      iv: iv.toString('hex')
    };
  } catch (error) {
    logger.error({
      message: 'Error encrypting session for Redis:',
      error
    });
    throw error;
  }
};

const decryptData = (encryptedData, passwordHash) => {
  const isValidEncryptedData = encryptedData.hasOwnProperty('iv') && encryptedData.hasOwnProperty('encryptedSession');

  if (!passwordHash || !isValidEncryptedData) {
    return encryptedData.string || defaultStringifiedJson;
  }

  try {
    const iv = Buffer.from(encryptedData.iv, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, passwordHash, iv);
    let decryptedString = decipher.update(encryptedData.encryptedSession, 'hex', 'utf8');
    decryptedString += decipher.final('utf8');

    return decryptedString;
  } catch (error) {
    logger.error({
      message: 'Error decrypting session from Redis:',
      error
    });
    throw error;
  }
};

const createSerializer = req => {
  let passwordHash = false;

  const idamUserId = idam.userId(req);
  if (idamUserId) {
    passwordHash = crypto.createHash('md5')
      .update(sessionEncryptionSecret + idamUserId, 'utf-8')
      .digest('hex')
      .toUpperCase();
  }

  return {
    parse: string => {
      const redisData = JSON.parse(string);
      const decryptedData = decryptData(redisData, passwordHash);
      return JSON.parse(decryptedData);
    },
    stringify: session => {
      const sessionStringified = JSON.stringify(session);
      const encryptedData = encryptData(sessionStringified, passwordHash);
      return JSON.stringify(encryptedData);
    }
  };
};

module.exports = {
  createSerializer,
  encryptData,
  decryptData
};

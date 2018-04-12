const CONF = require('config');
const crypto = require('crypto');
const logger = require('@hmcts/nodejs-logging').Logger.getLogger(__filename);
const jwt = require('jsonwebtoken');

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
    logger.error(`Error encrypting session for Redis: ${error}`);
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
    logger.error(`Error decrypting session from Redis: ${error}`);
    throw error;
  }
};

const createSerializer = (req, res) => {
  const authToken = req.cookies && req.cookies['__auth-token'] ? req.cookies['__auth-token'] : false;
  let passwordHash = false;

  // Create password using application secret and idamUserId
  if (authToken) {
    let idamUserId = null;
    try {
      idamUserId = jwt.decode(authToken).id;
    } catch (error) {
      res.clearCookie('__auth-token');
      throw error;
    }

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

'use strict';

const crypto = require('crypto');
const CONF = require('config');
const logger = require('app/services/logger')
  .logger(__filename);

const algorithm = 'aes-256-cbc';
const bufferSize = 16;
const iv = Buffer.alloc(bufferSize, 0); // Initialization vector.
const keyLen = 32;

const createToken = params => {
  const tokenKey = CONF.services.equalityAndDiversity.tokenKey;
  let encrypted = '';

  if (tokenKey) {
    logger.infoWithReq(null, 'createToken', `Using ${tokenKey === 'SERVICE_TOKEN_KEY' ? 'local' : 'Azure KV'} secret for PCQ token key`);
    const key = crypto.scryptSync(tokenKey, 'salt', keyLen);
    // Convert all params to string before encrypting
    Object.keys(params).forEach(p => {
      params[p] = String(params[p]);
    });
    const strParams = JSON.stringify(params);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    encrypted = cipher.update(strParams, 'utf8', 'hex');
    encrypted += cipher.final('hex');
  } else {
    logger.errorWithReq(null, 'createToken', 'PCQ token key is missing.');
  }

  return encrypted;
};

module.exports = createToken;

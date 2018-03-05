const clamAv = require('clam-engine');
const logger = require('@hmcts/nodejs-logging').getLogger(__filename);
const errors = require('app/resources/errors');
const fileManagement = require('app/services/fileManagement');

const createEngine = () => {
  return new Promise((resolve, reject) => {
    clamAv.createEngine((error, engine) => {
      if (error) {
        logger.error(`Error when creating clamAv engine ${error}`);
        return reject(error);
      }
      return resolve(engine);
    });
  });
};

const scanFile = (engine, file) => {
  return new Promise((resolve, reject) => {
    engine.scanFile(file.path, (error, virus) => {
      if (error) {
        logger.error(`Error when scanning file ${error}`);
        return reject(error);
      }
      if (virus) {
        logger.error(`Virus found when scanning file ${virus}`);
        return reject(errors.virusFoundInFile);
      }
      return resolve(file);
    });
  })
    .catch(error => {
      fileManagement.removeFile(file);
      throw error;
    });
};

const scan = file => {
  if (!process.env.EVIDENCE_MANAGEMENT_CLIENT_API_URL) {
    return file;
  }
  return createEngine()
    .then(engine => {
      return scanFile(engine, file);
    });
};

module.exports = {
  scan,
  createEngine,
  scanFile
};

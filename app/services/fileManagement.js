const tmp = require('tmp');
const fs = require('fs');
const util = require('util');
const logger = require('app/services/logger').logger(__filename);
const formidable = require('formidable');

const saveFileFromRequest = req => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (error, fields, files) => {
      if (error) {
        logger.error(`Unable to parse request ${error}`, req);
        return reject(error);
      }
      return resolve(files.file);
    });
  });
};

const saveFileFromBuffer = (buffer, fileName) => {
  return new Promise((resolve, reject) => {
    const tmpFileCreated = (error, path) => {
      if (error) {
        logger.error(`Unable to create temporary file ${error}`);
        return reject(error);
      }

      return fs.writeFile(path, buffer, writeBufferError => {
        if (writeBufferError) {
          logger.error(`Unable to write buffer to temporary file ${writeBufferError}`);
          return reject(writeBufferError);
        }

        return resolve({ path, name: fileName });
      });
    };

    tmp.file(tmpFileCreated);
  });
};

const removeFile = file => {
  const unlink = util.promisify(fs.unlink);
  return unlink(file.path)
    .catch(error => {
      logger.error(`Unable to remove file ${error}`);
      throw error;
    });
};

module.exports = {
  saveFileFromRequest,
  saveFileFromBuffer,
  removeFile
};

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
        logger.errorWithReq(null, 'parse_error', 'Unable to parse request form', error.message);
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
        logger.errorWithReq(null, 'file_save_error', 'Unable to create temporary file', error);
        return reject(error);
      }

      return fs.writeFile(path, buffer, writeBufferError => {
        if (writeBufferError) {
          logger.errorWithReq(null, 'file_save_error', 'Unable to write buffer to temporary file', error);
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
      logger.errorWithReq(null, 'file_remove_error', 'Unable to remove file', error.message);
      throw error;
    });
};

module.exports = {
  saveFileFromRequest,
  saveFileFromBuffer,
  removeFile
};

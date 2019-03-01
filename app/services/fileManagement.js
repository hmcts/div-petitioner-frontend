const fs = require('fs');
const util = require('util');
const logger = require('app/services/logger').logger(__filename);
const formidable = require('formidable');

const saveFileFromRequest = req => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (error, fields, files) => {
      if (error) {
        logger.errorWithReq(req, 'parse_error', 'Unable to parse request form', error.message);
        return reject(error);
      }
      return resolve(files.file);
    });
  });
};

const removeFile = (req, file) => {
  const unlink = util.promisify(fs.unlink);
  return unlink(file.path)
    .catch(error => {
      logger.errorWithReq(req, 'file_remove_error', 'Unable to remove file', error.message);
      throw error;
    });
};

module.exports = {
  saveFileFromRequest,
  removeFile
};

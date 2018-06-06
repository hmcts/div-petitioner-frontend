const httpStatus = require('http-status-codes');
const logger = require('app/services/logger').logger(__filename);
const evidenceManagmentService = require('app/services/evidenceManagmentService');
const { map } = require('lodash');
const fileManagment = require('app/services/fileManagement');
const errors = require('app/resources/errors');

const getLatestSession = req => {
  return new Promise(resolve => {
    req.session.reload(() => {
      resolve();
    });
  });
};

const removeFile = (req, res, nameSpace) => {
  return new Promise(resolve => {
    const removeFileToDelete = file => {
      return file.fileUrl !== req.query.fileUrl;
    };

    getLatestSession(req)
      .then(() => {
        req.session[nameSpace] = req.session[nameSpace]
          .filter(removeFileToDelete);
        resolve();
      });
  });
};

const validatePostRequest = (req, nameSpace) => {
  const maximumNumberOfFiles = 10;
  const maximumOf10Files = req.session && req.session[nameSpace] && req.session[nameSpace].length >= maximumNumberOfFiles;

  return new Promise((resolve, reject) => {
    if (maximumOf10Files) {
      return reject(errors.maximumFilesExceeded);
    }
    return resolve(req);
  });
};

const resetAllErrors = req => {
  // reset previous errors
  Object.keys(errors).forEach(key => {
    delete req.session[errors[key].code];
  });
};

const handleResponseFromFileStore = (req, res, files, nameSpace) => {
  return getLatestSession(req)
    .then(() => {
      req.session[nameSpace] = req.session[nameSpace] || [];
      const mergedFiles = [
        ...req.session[nameSpace],
        ...files
      ];
      req.session[nameSpace] = mergedFiles;
      return files;
    });
};

const errorHandler = (error = errors.unknown, req, res, next) => {
  let errorToReturn = error;

  // if we do not know this error then set to unknown
  if (!map(errors, 'code').includes(errorToReturn.code)) {
    errorToReturn = errors.unknown;
  }

  logger.error({
    message: 'Error when uploading to Evidence Management:',
    errorToReturn,
    error
  });

  const isJsRequest = req.query && req.query.js;

  if (isJsRequest) {
    return res.status(errorToReturn.status).send(errorToReturn);
  }

  resetAllErrors(req);

  // set current error
  req.session[errorToReturn.code] = 'invalid';

  return next();
};

const createHandler = nameSpace => {
  // @todo Refactor this to reduce complexity.
  return function handler(req, res, next) { // eslint-disable-line complexity
    if (req.body && req.body.submit) {
      resetAllErrors(req);
      return next();
    }

    const token = req.cookies['__auth-token'];

    // delete file from get link query param `noJsDelete=filename.jpg`
    const method = req.query.noJsDelete ? 'delete' : req.method.toLowerCase();
    const isFormUpload = req.headers['content-type'] && req.headers['content-type'].indexOf('multipart/form-data') !== -1;

    if (method === 'post' && !isFormUpload) {
      return next();
    }

    req.session[nameSpace] = req.session[nameSpace] || [];

    const redirectUrl = this.url; // eslint-disable-line no-invalid-this
    const isJsRequest = req.query && req.query.js;

    switch (method) {
    case 'delete':
      return removeFile(req, res, nameSpace)
        .then(() => {
          if (isJsRequest) {
            return res.status(httpStatus.OK).send();
          }
          return res.redirect(redirectUrl);
        });
    case 'post':
      return validatePostRequest(req, nameSpace)
        .then(fileManagment.saveFileFromRequest)
        .then(file => {
          return evidenceManagmentService.sendFile(file, { token });
        })
        .then(files => {
          return handleResponseFromFileStore(req, res, files, nameSpace);
        })
        .then(files => {
          if (isJsRequest) {
            return res.status(httpStatus.OK).send(files);
          }
          return res.redirect(redirectUrl);
        })
        .catch(error => {
          return errorHandler(error, req, res, next);
        });
    default:
      return next();
    }
  };
};

module.exports = {
  createHandler,
  errorHandler,
  handleResponseFromFileStore,
  resetAllErrors,
  removeFile,
  validatePostRequest,
  errors
};

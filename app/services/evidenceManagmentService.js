const CONF = require('config');
const superagent = require('superagent');
const httpStatus = require('http-status-codes');
const logger = require('app/services/logger').logger(__filename);
const errors = require('app/resources/errors');
const fileManagment = require('app/services/fileManagement');

const evidenceManagmentClientUploadUrl = `${CONF.evidenceManagmentClient.url}${CONF.evidenceManagmentClient.uploadEndpoint}`;
const defaultEMCErrorMessage = 'Error uploading to evidence management client';

const mockFileResponse = (file = { name: 'image.jpg' }) => {
  return [
    {
      fileName: file.name,
      fileUrl: file.path,
      status: 'OK'
    }
  ];
};

const handleResponse = (req, body, resolve, reject) => {
  if (body.error && body.error.length) {
    logger.errorWithReq(req, 'evidence_upload_error', 'Error when uploading to Evidence Management', body);
    return reject(body);
  }

  const dataIsNotValid = !Array.isArray(body) || !body[0].status || body[0].status !== 'OK';
  if (dataIsNotValid) {
    logger.errorWithReq(req, 'evidence_upload_not_valid', 'Evidence management data not valid', body);
    return reject();
  }

  logger.infoWithReq(req, 'evidence_uploaded', 'Uploaded files to Evidence Management Client', body);

  return resolve(body);
};

const sendFile = (req, file, options = { token: 'token' }) => {
  return new Promise((resolve, reject) => {
    // return mock if no client API available
    if (!CONF.evidenceManagmentClient.url) {
      return handleResponse(req, mockFileResponse(file), resolve, reject);
    }
    return superagent
      .post(evidenceManagmentClientUploadUrl)
      .set({ Authorization: options.token })
      .set('enctype', 'multipart/form-data')
      .attach('file', file.path, file.name)
      .end((error, response = { statusCode: null }) => {
        fileManagment.removeFile(req, file);
        if (error || response.statusCode !== httpStatus.OK) {
          const errorToReturn = new Error(error || response.body || defaultEMCErrorMessage);
          errorToReturn.status = response.statusCode;

          logger.errorWithReq(req, 'evidence_error_response', 'Error response from evidence management', error);

          if (response && response.errorCode === 'invalidFileType') {
            return reject(errors.fileTypeInvalid);
          }
          return reject(errorToReturn);
        }
        return handleResponse(req, response.body, resolve, reject);
      });
  });
};

module.exports = {
  sendFile,
  handleResponse,
  mockFileResponse
};

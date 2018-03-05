const httpStatus = require('http-status-codes');

const errors = {
  maximumFilesExceeded: {
    code: 'errorMaximumFilesExceeded',
    message: 'maximum files exceeded',
    status: httpStatus.BAD_REQUEST
  },
  fileTypeInvalid: {
    code: 'errorFileTypeInvalid',
    message: 'file type invalid',
    status: httpStatus.BAD_REQUEST
  },
  fileSizeTooLarge: {
    code: 'errorFileSizeTooLarge',
    message: 'file size too large',
    status: httpStatus.BAD_REQUEST
  },
  virusFoundInFile: {
    code: 'errorVirusFoundInFile',
    message: 'virus found in file',
    status: httpStatus.BAD_REQUEST
  },
  unknown: {
    code: 'errorUnknown',
    message: 'unknown',
    status: httpStatus.BAD_REQUEST
  }
};

module.exports = errors;
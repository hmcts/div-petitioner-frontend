const { createUris } = require('@hmcts/div-document-express-handler');
const config = require('config');

const docConfig = {
  documentNamePath: config.document.documentNamePath,
  documentWhiteList: config.document.filesWhiteList
};

const getDownloadableFiles = session => {
  return createUris(session.d8, docConfig);
};

module.exports = {
  getDownloadableFiles
};

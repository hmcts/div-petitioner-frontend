const config = require('config');
const idam = require('app/services/idam');
const { initDocumentHandler } = require('@hmcts/div-document-express-handler');

const documentWhiteList = config.document.documentWhiteList;

const initDocumentHandlerFor = app => {
  const middleware = [ idam.protect() ];
  const args = {
    documentServiceUrl: `${config.evidenceManagmentClient.url}${config.evidenceManagmentClient.downloadEndpoint}`,
    sessionFileCollectionsPaths: [config.document.sessionPath],
    documentNamePath: config.document.documentNamePath,
    documentWhiteList
  };
  initDocumentHandler(app, middleware, args);
};

module.exports = { initDocumentHandlerFor, documentWhiteList };

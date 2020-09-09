const { createUris } = require('@hmcts/div-document-express-handler');
const config = require('config');

const docConfig = {
  documentNamePath: config.document.documentNamePath,
  documentWhiteList: config.document.filesWhiteList
};

/**
 * Method takes a list of generated documents info and shapes them for the UI, mainly adding URI where the
 * actual document can be downloaded from, usually via a link on the page.
 *
 * The createUris document handler utility removes numbers from file type so d8petition1234 would be d8petition
 * This matches the list of files in the configuration whitelist property. In other word only those documents
 * whitelisted in the config would be returned.
 *
 * @param session Session data containing d8 property, an array of documents
 * @returns {*} List of generated documents or an empty if none
 */
const getDownloadableFiles = session => {
  return createUris(session.d8, docConfig);
};

module.exports = {
  getDownloadableFiles
};

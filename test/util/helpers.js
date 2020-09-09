const { filter } = require('lodash');

// returns the file label defined in the content json definition
const getTemplateFileLabel = (content, fileType) => {
  return content.resources.en.translation.content.files[fileType];
};

// filters a list of file types and returns only specified type
const getOnlyFileType = (fileTypes, typeName) => {
  return filter(fileTypes, fileType => {
    return fileType === typeName;
  });
};

module.exports = {
  getTemplateFileLabel,
  getOnlyFileType
};

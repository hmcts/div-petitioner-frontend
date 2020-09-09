// returns the file label defined in the content json definition
const getTemplateFileLabel = (content, fileType) => {
  return content.resources.en.translation.content.files[fileType];
};

module.exports = {
  getTemplateFileLabel
};

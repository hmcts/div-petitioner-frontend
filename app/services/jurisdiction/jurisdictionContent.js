const walkMap = require('app/core/utils/treeWalker');
const i18next = require('i18next');
const content = require('./content');

const getConnectionContent = (session, lang = 'en') => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init(content, error => {
    if (error) {
      process.emit('applicaton-log', {
        level: 'ERROR',
        message: 'divorce-application-i18n. Failed to initialise i18next',
        fields: {
          step: 'service-jurisdiction-connections',
          error: error.message
        }
      });
    }
  });

  i18nextInstance.changeLanguage(lang);

  return walkMap(content.resources.en.translation.content, path => {
    return i18nextInstance.t(`content.${path}`, session);
  });
};

module.exports = getConnectionContent;

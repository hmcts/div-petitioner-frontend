const fs = require('fs');
const Negotiator = require('negotiator');

const defaults = {
  viewDirectory: '',
  fileExtension: ''
};

function factory(opts) {
  const options = Object.assign(defaults, opts);
  const templates = fs.readdirSync(options.viewDirectory)
    .filter(name => {
      return name.indexOf(`.${options.fileExtension}`);
    });

  function i18nTemplate(base, templateCallback) {
    function middleware(req, res) {
      const negotiator = new Negotiator(req);
      // Filter templates with the desired base name and get a list of available languages.
      const templatePattern = new RegExp(`^(${base}-?)([a-z]{2})?(\\.${options.fileExtension})$`);
      const availableTemplateLanguages = templates.filter(name => {
        return templatePattern.exec(name);
      })
        .map(name => {
          return name.replace(templatePattern, '$2');
        })
        .filter(name => {
          return Boolean(name);
        });

      const clientLanguages = negotiator.languages(availableTemplateLanguages);
      // Find if there is a template in one of the preferred language.
      const language = clientLanguages.find(lang => {
        return availableTemplateLanguages.find(name => {
          return lang === name;
        });
      });
      const view = language ? `${base}-${language}` : base;

      templateCallback(view, req, res);
    }

    return middleware;
  }

  return i18nTemplate;
}

module.exports = factory;

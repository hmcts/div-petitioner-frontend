const contentEn = require('app/steps/error-generic/content.json').resources.en.translation.content;
const contentCy = require('app/steps/error-generic/content.json').resources.cy.translation.content;

const pagePath = '/generic-error';

function checkGenericErrorPage(language = 'en') {
  const genericError = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.see(genericError.title);
}

module.exports = { checkGenericErrorPage };

const content = require ('app/steps/error-generic/content.json').resources.en.translation.content;
const contentCy = require ('app/steps/error-generic/content.json').resources.cy.translation.content;
const pagePath = '/generic-error';

function checkGenericErrorPage(language = 'en') {

  const stepContent = language === 'en' ? content : contentCy;
  
  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);

  I.see(stepContent.title);
}

module.exports = { checkGenericErrorPage };

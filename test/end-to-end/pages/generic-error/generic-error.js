const content = require ('app/steps/error-generic/content.json').resources.en.translation.content;
const contentCy = require ('app/steps/error-generic/content.json').resources.cy.translation.content;
const pagePath = '/generic-error';

function checkGenericErrorPage(language = 'en') {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);

  if (language === 'en') {
    I.see(content.title);
  } else {
    I.see(contentCy.title);
  }
}

module.exports = { checkGenericErrorPage };

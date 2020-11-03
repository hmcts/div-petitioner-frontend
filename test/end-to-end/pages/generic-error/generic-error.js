const content = require ('app/steps/error-generic/content.json').resources.en.translation.content;
const contentCy = require ('app/steps/error-generic/content.json').resources.cy.translation.content;
const pagePath = '/generic-error';

function checkGenericErrorPage() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.see(content.title);
}

function checkGenericErrorPageCy() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  I.see(contentCy.title);
}

module.exports = { checkGenericErrorPage, checkGenericErrorPageCy };

const content = require ('app/steps/error-generic/content.json').resources.en.translation.content;
const pagePath = '/generic-error';

function checkGenericErrorPage() {

  const I = this;

  I.waitInUrl(pagePath);
  I.seeCurrentUrlEquals(pagePath);
  I.see(content.title);
}
module.exports = { checkGenericErrorPage };

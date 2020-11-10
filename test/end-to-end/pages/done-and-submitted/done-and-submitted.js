const content = require ('app/steps/done-and-submitted/content.json').resources.en.translation.content;
const pagePath = '/done-and-submitted';

function amDoneAndSubmitted() {

  const I = this;

  I.waitInUrl(pagePath);
  I.seeCurrentUrlEquals(pagePath);
  I.see(content.title);
}
module.exports = { amDoneAndSubmitted };

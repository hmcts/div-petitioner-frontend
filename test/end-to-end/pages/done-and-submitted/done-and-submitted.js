const content = require ('app/steps/done-and-submitted/content.json').resources.en.translation.content;
const contentCy = require ('app/steps/done-and-submitted/content.json').resources.cy.translation.content;

const pagePath = '/done-and-submitted';

function amDoneAndSubmitted(language = 'en') {

  const stepContent = language === 'en' ? content : contentCy;

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);

  I.see(stepContent.title);

}
module.exports = { amDoneAndSubmitted };

const contentEn = require('app/steps/done-and-submitted/content.json').resources.en.translation.content;
const contentCy = require('app/steps/done-and-submitted/content.json').resources.cy.translation.content;

const pagePath = '/done-and-submitted';

function amDoneAndSubmitted(language = 'en') {
  const doneAndSubmitted = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.see(doneAndSubmitted.title);
}

module.exports = { amDoneAndSubmitted };

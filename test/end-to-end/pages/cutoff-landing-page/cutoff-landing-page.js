const contentEn = require ('app/steps/cutoff-landing-page/content.json').resources.en.translation.content;
const contentCy = require ('app/steps/cutoff-landing-page/content.json').resources.cy.translation.content;
const pagePath = '/cutoff-landing-page';

function checkCutoffLandingPage(language = 'en') {
  const cutoffLandingPage = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.see(cutoffLandingPage.title);
}

module.exports = { checkCutoffLandingPage };

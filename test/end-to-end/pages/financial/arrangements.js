const content = require('app/steps/financial/arrangements/content.json').resources.en.translation.content;
const pagePath = '/about-divorce/financial/arrangements';


function selectFinancialArrangements() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);

  I.checkOption(content.yes);
  I.checkOption(content.petitioner);
  I.checkOption(content.children);
  I.navByClick('Continue');
}

module.exports = { selectFinancialArrangements };
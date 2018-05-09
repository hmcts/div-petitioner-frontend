const content = require('app/steps/financial/arrangements/content.json').resources.en.translation.content;

function selectFinancialArrangements() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/financial/arrangements');
  I.checkOption(content.yes);
  I.checkOption(content.petitioner);
  I.checkOption(content.children);
  I.navByClick('Continue');
}

module.exports = { selectFinancialArrangements };
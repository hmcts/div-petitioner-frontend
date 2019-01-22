const content = require('app/steps/grounds-for-divorce/lived-apart-since/content.json').resources.en.translation.content;

function selectLivingApartTime() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/separation/lived-apart-since');
  I.checkOption(content.yes);
  I.navByClick('Continue');
}

module.exports = { selectLivingApartTime };
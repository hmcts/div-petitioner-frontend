const content = require('app/steps/grounds-for-divorce/adultery/wish-to-name/content.json').resources.en.translation.content;

function selectWishToName() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/adultery/wish-to-name');
  I.checkOption(content.yes);
  I.navByClick('Continue');
}

module.exports = { selectWishToName };
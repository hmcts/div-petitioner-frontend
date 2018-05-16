const content = require('app/steps/grounds-for-divorce/adultery/when/content.json').resources.en.translation.content;

function selectAdulteryWhen() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/adultery/when');
  I.checkOption(content.no);
  I.navByClick('Continue');
}

module.exports = { selectAdulteryWhen };
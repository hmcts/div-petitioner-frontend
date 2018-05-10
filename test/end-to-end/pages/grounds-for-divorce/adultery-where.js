const content = require('app/steps/grounds-for-divorce/adultery/where/content.json').resources.en.translation.content;

function selectAdulteryWhere() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/adultery/where');
  I.checkOption(content.no);
  I.navByClick('Continue');
}

module.exports = { selectAdulteryWhere };
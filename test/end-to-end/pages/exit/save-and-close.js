const content = require('app/content/common-en').resources.en.translation;

function clickSaveAndCLose() {
  const I = this;

  I.navByClick(content.saveAndClose);
}

module.exports = { clickSaveAndCLose };

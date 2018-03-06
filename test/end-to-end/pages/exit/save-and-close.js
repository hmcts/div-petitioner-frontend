const content = require('app/content/common.json').resources.en.translation;

function clickSaveAndCLose() {
  const I = this;

  I.click(content.saveAndClose);
}

module.exports = { clickSaveAndCLose };
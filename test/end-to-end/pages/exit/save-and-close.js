function clickSaveAndClose() {
  const I = this;

  I.waitForNavigation();
  I.clickLink('saveAndClose');
}

module.exports = { clickSaveAndClose };

class JSWait extends codecept_helper {

  _beforeStep(step) {

    // Wait for content to load before checking URL
    if (step.name === 'seeCurrentUrlEquals') {
      return this.helpers['WebDriverIO'].waitForElement('#content', 10);
    }
  }
}

module.exports = JSWait;
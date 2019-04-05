function viewSystemMessage() {

  const I = this;

  I.seeCurrentUrlEquals('/system-message');
  I.navByClick('Continue');
}

module.exports = { viewSystemMessage };
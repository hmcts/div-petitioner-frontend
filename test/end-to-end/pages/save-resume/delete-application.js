const content = require('app/steps/save-resume/confirm-remove-saved-application/content.json').resources.en.translation.content;

function confirmRemoveApplication() {
  const I = this;

  I.seeCurrentUrlEquals('/save-return/delete-application');
  I.see(content.question);
  I.click(content.yes);

  I.navByClick('Continue');
}

function declineRemoveApplicaiton() {
  const I = this;

  I.seeCurrentUrlEquals('/save-return/delete-application');
  I.see(content.question);
  I.click(content.no);

  I.navByClick('Continue');
}

module.exports = {
  confirmRemoveApplication,
  declineRemoveApplicaiton
};
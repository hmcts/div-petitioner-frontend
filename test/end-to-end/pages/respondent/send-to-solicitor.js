const selectContent = require('app/steps/respondent/correspondence/send-to-solicitor/content.json').resources.en.translation.content;

function chooseSendPapersToADifferentAddress() {
  completeSendToSolicitorPage(this, selectContent.correspondence);
}

function completeSendToSolicitorPage(I, chosenOption) {
  I.seeCurrentUrlEquals('/petitioner-respondent/correspondence/send-to-solicitor');
  I.checkOption(chosenOption);
  I.navByClick('Continue');
}

module.exports = {
  chooseSendPapersToADifferentAddress
};
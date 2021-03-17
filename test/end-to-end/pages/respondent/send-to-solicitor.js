const selectContent = require('app/steps/respondent/correspondence/send-to-solicitor/content.json').resources.en.translation.content;

function chooseSendPapersToADifferentAddress() {
  completeSendToSolicitorPage(this, selectContent.featureToggleRespSol.anotherAddress);
}

function completeSendToSolicitorPage(I, chosenOption) {
  I.seeCurrentUrlEquals('/petitioner-respondent/correspondence/send-to-solicitor');
  I.checkOption(chosenOption);
  I.navByClick('Continue');
}

module.exports = {
  chooseSendPapersToADifferentAddress
};

const selectContent = require('app/steps/respondent/correspondence/send-to-solicitor/content.json').resources.en.translation.content;


function chooseSendPapersToSolicitorsAddress(respondent) {
  const selection = (respondent === 'husband') ? selectContent['solicitor-husband'] : selectContent['solicitor-wife'];
  completeSendToSolicitorPage(this, selection);
}

function chooseSendPapersToADifferentAddress() {
  completeSendToSolicitorPage(this, selectContent.correspondence);
}

function completeSendToSolicitorPage(I, chosenOption) {
  I.seeCurrentUrlEquals('/petitioner-respondent/correspondence/send-to-solicitor');
  I.checkOption(chosenOption);
  I.navByClick('Continue');
}


module.exports = {
  chooseSendPapersToSolicitorsAddress,
  chooseSendPapersToADifferentAddress
};
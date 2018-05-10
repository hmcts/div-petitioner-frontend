const residualJurisdiction = require('app/steps/jurisdiction/residual/content.json').resources.en.translation.content;

function chooseYesForResidualJurisdiction() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/residual');
  I.checkOption(residualJurisdiction.yes);
  I.navByClick('Continue');
}

function chooseNoForResidualJurisdiction() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/residual');
  I.checkOption(residualJurisdiction.no);
  I.navByClick('Continue');
}

module.exports = {
  chooseYesForResidualJurisdiction,
  chooseNoForResidualJurisdiction
};
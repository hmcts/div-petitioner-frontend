const residualJurisdiction = require('app/steps/njurisdiction/residual/content.json').resources.en.translation.content;

function chooseYesForResidualJurisdiction() {

  const I = this;

  I.seeCurrentUrlEquals('/njurisdiction/residual');
  I.checkOption(residualJurisdiction.yes);
  I.click('Continue');
}

function chooseNoForResidualJurisdiction() {

  const I = this;

  I.seeCurrentUrlEquals('/njurisdiction/residual');
  I.checkOption(residualJurisdiction.no);
  I.click('Continue');
}

module.exports = {
  chooseYesForResidualJurisdiction,
  chooseNoForResidualJurisdiction
};
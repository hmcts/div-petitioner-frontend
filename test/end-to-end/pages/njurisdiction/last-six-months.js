const content = require('app/steps/njurisdiction/last-six-months/content.json').resources.en.translation.content;

function chooseYesJurisdictionLastSixMonths() {
  completeLastSixMonthsPage(this, content.yes);
}

function chooseNoJurisdictionLastSixMonths() {
  completeLastSixMonthsPage(this, content.no);
}

function completeLastSixMonthsPage(I, chosenOption) {
  I.seeCurrentUrlEquals('/njurisdiction/last-six-months');
  I.checkOption(chosenOption);
  I.click('Continue');
}


module.exports = { chooseYesJurisdictionLastSixMonths, chooseNoJurisdictionLastSixMonths };
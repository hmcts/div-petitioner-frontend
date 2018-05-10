const content = require('app/steps/jurisdiction/last-six-months/content.json').resources.en.translation.content;

function chooseYesJurisdictionLastSixMonths() {
  completeLastSixMonthsPage(this, content.yes);
}

function chooseNoJurisdictionLastSixMonths() {
  completeLastSixMonthsPage(this, content.no);
}

function completeLastSixMonthsPage(I, chosenOption) {
  I.seeCurrentUrlEquals('/jurisdiction/last-six-months');
  I.checkOption(chosenOption);
  I.navByClick('Continue');
}


module.exports = { chooseYesJurisdictionLastSixMonths, chooseNoJurisdictionLastSixMonths };
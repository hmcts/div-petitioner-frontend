const content = require('app/steps/jurisdiction/last-habitual-residence/content.json').resources.en.translation.content;



function chooseYesLastHabitualResidence() {
  completeLastHabitualResidence(this, content.yes);
}

function chooseNoLastHabitualResidence() {
  completeLastHabitualResidence(this, content.no);
}

function completeLastHabitualResidence(I, chosenOption) {
  I.seeCurrentUrlEquals('/jurisdiction/last-habitual-residence');
  I.checkOption(chosenOption);
  I.navByClick('Continue');
}


module.exports = { chooseYesLastHabitualResidence, chooseNoLastHabitualResidence };
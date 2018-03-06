const content = require('app/steps/njurisdiction/last-habitual-residence/content.json').resources.en.translation.content;



function chooseYesLastHabitualResidence() {
  completeLastHabitualResidence(this, content.yes);
}

function chooseNoLastHabitualResidence() {
  completeLastHabitualResidence(this, content.no);
}

function completeLastHabitualResidence(I, chosenOption) {
  I.seeCurrentUrlEquals('/njurisdiction/last-habitual-residence');
  I.checkOption(chosenOption);
  I.click('Continue');
}


module.exports = { chooseYesLastHabitualResidence, chooseNoLastHabitualResidence };
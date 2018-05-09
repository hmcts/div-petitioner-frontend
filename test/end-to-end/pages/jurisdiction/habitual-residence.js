const habituallyResident = require('app/steps/jurisdiction/habitual-residence/content.json').resources.en.translation.content;


function chooseBothHabituallyResident() {
  setHabitualResidence(this, {
    'petitioner': habituallyResident.yes,
    'respondent': habituallyResident.yes
  });
}

function chooseNeitherHabituallyResident() {
  setHabitualResidence(this, {
    'petitioner': habituallyResident.no,
    'respondent': habituallyResident.no
  });
}

function choosePetitionerHabituallyResident() {
  setHabitualResidence(this, {
    'petitioner': habituallyResident.yes,
    'respondent': habituallyResident.no
  });
}

function chooseRespondentHabituallyResident() {
  setHabitualResidence(this, {
    'petitioner': habituallyResident.no,
    'respondent': habituallyResident.yes
  });
}

function setHabitualResidence(I, residenceFor) {
  I.seeCurrentUrlEquals('/jurisdiction/habitual-residence');
  I.navByClick('#jurisdictionPetitionerResidence_' + residenceFor.petitioner);
  I.navByClick('#jurisdictionRespondentResidence_' + residenceFor.respondent);
  I.navByClick('Continue');
}


module.exports = {
  chooseBothHabituallyResident,
  chooseNeitherHabituallyResident,
  choosePetitionerHabituallyResident,
  chooseRespondentHabituallyResident
};
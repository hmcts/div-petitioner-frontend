const habituallyResident = require('app/steps/jurisdiction/habitual-residence/content.json').resources.en.translation.content;
const pagePath = '/jurisdiction/habitual-residence';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function chooseBothHabituallyResident(language = 'en') {
  setHabitualResidence(this, {
    'petitioner': habituallyResident.yes,
    'respondent': habituallyResident.yes
  }, language);
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

function setHabitualResidence(I, residenceFor, language) {
  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).click('#jurisdictionPetitionerResidence_' + residenceFor.petitioner);
  I.retry(2).click('#jurisdictionRespondentResidence_' + residenceFor.respondent);

  if (language === 'en') {
    I.navByClick(commonContentEn.continue);
  } else {
    I.navByClick(commonContentCy.continue);
  }

}


module.exports = {
  chooseBothHabituallyResident,
  chooseNeitherHabituallyResident,
  choosePetitionerHabituallyResident,
  chooseRespondentHabituallyResident
};

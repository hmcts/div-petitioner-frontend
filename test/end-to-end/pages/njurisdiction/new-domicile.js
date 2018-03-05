function chooseBothDomiciled() {

  const I = this;

  I.seeCurrentUrlEquals('/njurisdiction/domicile');

  I.click('[for~="jurisdictionPetitionerDomicile_Yes"]');
  I.click('[for~="jurisdictionRespondentDomicile_Yes"]');
  I.click('Continue');
}

function chooseNeitherDomiciled() {

  const I = this;

  I.seeCurrentUrlEquals('/njurisdiction/domicile');

  I.click('[for~="jurisdictionPetitionerDomicile_No"]');
  I.click('[for~="jurisdictionRespondentDomicile_No"]');
  I.click('Continue');
}

function choosePetitionerDomiciled() {

  const I = this;

  I.seeCurrentUrlEquals('/njurisdiction/domicile');

  I.click('[for~="jurisdictionPetitionerDomicile_Yes"]');
  I.click('[for~="jurisdictionRespondentDomicile_No"]');
  I.click('Continue');
}

function chooseRespondentDomiciled() {

  const I = this;

  I.seeCurrentUrlEquals('/njurisdiction/domicile');

  I.click('[for~="jurisdictionPetitionerDomicile_No"]');
  I.click('[for~="jurisdictionRespondentDomicile_Yes"]');
  I.click('Continue');
}
module.exports = {
  chooseBothDomiciled,
  choosePetitionerDomiciled,
  chooseRespondentDomiciled,
  chooseNeitherDomiciled
};
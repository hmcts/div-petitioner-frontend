function chooseBothDomiciled() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/domicile');

  I.navByClick('[for~="jurisdictionPetitionerDomicile_Yes"]');
  I.navByClick('[for~="jurisdictionRespondentDomicile_Yes"]');
  I.navByClick('Continue');
}

function chooseNeitherDomiciled() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/domicile');

  I.navByClick('[for~="jurisdictionPetitionerDomicile_No"]');
  I.navByClick('[for~="jurisdictionRespondentDomicile_No"]');
  I.navByClick('Continue');
}

function choosePetitionerDomiciled() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/domicile');

  I.navByClick('[for~="jurisdictionPetitionerDomicile_Yes"]');
  I.navByClick('[for~="jurisdictionRespondentDomicile_No"]');
  I.navByClick('Continue');
}

function chooseRespondentDomiciled() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/domicile');

  I.navByClick('[for~="jurisdictionPetitionerDomicile_No"]');
  I.navByClick('[for~="jurisdictionRespondentDomicile_Yes"]');
  I.navByClick('Continue');
}
module.exports = {
  chooseBothDomiciled,
  choosePetitionerDomiciled,
  chooseRespondentDomiciled,
  chooseNeitherDomiciled
};
function chooseJurisdictionDomicile() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/domicile');
  I.checkOption('#jurisdictionDomicile_petitioner');
  I.click('Continue');
}

module.exports = { chooseJurisdictionDomicile };
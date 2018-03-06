function chooseJurisdictionLastResort(tick) {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/last-resort');
  if (tick) {

    I.checkOption('#oneOfResident');
    I.checkOption('#petitionerResident');
    I.checkOption('#petitionerResidentAndDomiciled');
  }
  I.click('Continue');

  if (!tick) {

    I.seeCurrentUrlEquals('/exit/jurisdiction/last-resort');
  }
}
module.exports = { chooseJurisdictionLastResort };
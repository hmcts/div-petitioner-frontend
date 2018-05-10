function enterCountryAndPlaceOfMarriage() {
  const I = this;

  I.seeCurrentUrlEquals('/about-your-marriage/foreign-certificate');
  I.fillField('countryName', 'Canada');
  I.fillField('placeOfMarriage', 'Quebec');
  I.navByClick('Continue');
}

module.exports = { enterCountryAndPlaceOfMarriage };
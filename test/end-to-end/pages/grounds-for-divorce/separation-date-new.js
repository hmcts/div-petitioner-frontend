function enterSeparationDateNew(decisionDay = '1', decisionMonth = '1', decisionYear = '2013',
  livingApartDay = '1', livingApartMonth = '1', livingApartYear = '2013') {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/separated');
  I.fillField('reasonForDivorceDecisionDay', decisionDay);
  I.fillField('reasonForDivorceDecisionMonth', decisionMonth);
  I.fillField('reasonForDivorceDecisionYear', decisionYear);
  I.fillField('reasonForDivorceLivingApartDay', livingApartDay);
  I.fillField('reasonForDivorceLivingApartMonth', livingApartMonth);
  I.fillField('reasonForDivorceLivingApartYear', livingApartYear);
  I.navByClick('Continue');
}
module.exports = { enterSeparationDateNew };

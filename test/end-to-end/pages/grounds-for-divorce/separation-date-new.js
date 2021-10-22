const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterSeparationDateNew(language = 'en', decisionDay = '1', decisionMonth = '1', decisionYear = '2013',
  livingApartDay = '1', livingApartMonth = '1', livingApartYear = '2013') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/separation-dates');
  I.fillField('reasonForDivorceDecisionDay', decisionDay);
  I.fillField('reasonForDivorceDecisionMonth', decisionMonth);
  I.fillField('reasonForDivorceDecisionYear', decisionYear);
  I.fillField('reasonForDivorceLivingApartDay', livingApartDay);
  I.fillField('reasonForDivorceLivingApartMonth', livingApartMonth);
  I.fillField('reasonForDivorceLivingApartYear', livingApartYear);
  I.click(commonContent.continue);
}

module.exports = { enterSeparationDateNew };

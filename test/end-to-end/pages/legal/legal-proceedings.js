const content = require('app/steps/legal/legal-proceedings/content.json').resources.en.translation.content;
const { mockSession } = require('test/fixtures');
const pagePath = '/about-divorce/legal-proceedings';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterLegalProceedings(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);

  if (language === 'en') {
    I.click('#legalProceedings_' + content.yes);
    I.checkOption(mockSession.legalProceedingsRelated[0]);
    I.fillField('legalProceedingsDetails', mockSession.legalProceedingsDetails);
  } else {
    I.click('#legalProceedings_' + content.no);
  }
  I.click(commonContent.continue);
}

module.exports = { enterLegalProceedings };

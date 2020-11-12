const contentEn = require('app/steps/legal/legal-proceedings/content.json').resources.en.translation.content;
const contentCy = require('app/steps/legal/legal-proceedings/content.json').resources.cy.translation.content;
const { mockSession } = require('test/fixtures');
const pagePath = '/about-divorce/legal-proceedings';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterLegalProceedings(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const legalProceedings = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);

  if (language === 'en') {
    I.click('#legalProceedings_' + legalProceedings.yes);
    I.checkOption(mockSession.legalProceedingsRelated[0]);
    I.fillField('legalProceedingsDetails', mockSession.legalProceedingsDetails);
    I.navByClick(commonContent.continue);
  } else {
    I.click('#legalProceedings_' + legalProceedings.no);
    I.navByClick(commonContent.continue);
  }
}

module.exports = { enterLegalProceedings };

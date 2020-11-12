const content = require('app/steps/legal/legal-proceedings/content.json').resources.en.translation.content;
const { mockSession } = require('test/fixtures');
const pagePath = '/about-divorce/legal-proceedings';

async function enterLegalProceedings() {

  const I = this;

  I.waitInUrl(pagePath);
  I.seeCurrentUrlEquals(pagePath);
  I.click('#legalProceedings_' + content.yes);
  I.waitForText(content.furtherDetails);

  const browserName = await I.getBrowserName();
  if (browserName === 'safari') {
    // Safari 13 & Saucelabs doesn't handle scrolling properly, so need to forceClick()
    I.forceClick(mockSession.legalProceedingsRelated[0]);
  } else {
    I.retry(2).checkOption(mockSession.legalProceedingsRelated[0]);
  }

  I.fillField('legalProceedingsDetails', mockSession.legalProceedingsDetails);
  I.navByClick('Continue');
}

module.exports = { enterLegalProceedings };

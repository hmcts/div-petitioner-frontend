const content = require('app/steps/legal/legal-proceedings/content.json').resources.en.translation.content;
const { mockSession } = require('test/fixtures');

function enterLegalProceedings() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/legal-proceedings');
  I.navByClick('#legalProceedings_' + content.yes);
  I.checkOption(mockSession.legalProceedingsRelated[0]);
  I.fillField('legalProceedingsDetails', mockSession.legalProceedingsDetails);
  I.navByClick('Continue');
}

module.exports = { enterLegalProceedings };

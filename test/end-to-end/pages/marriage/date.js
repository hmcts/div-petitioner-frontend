const { mockSession } = require('test/fixtures');

const pagePath = '/about-your-marriage/date-of-marriage-certificate';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterMarriageDate(language = 'en', day = mockSession.marriageDateDay.toString(),
  month = mockSession.marriageDateMonth.toString(),
  year = mockSession.marriageDateYear.toString()) {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;
  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);

  I.retry(2).fillField('marriageDateDay', day);
  I.fillField('marriageDateMonth', month);
  I.fillField('marriageDateYear', year);
  I.retry(3).click(commonContent.continue);
}

module.exports = { enterMarriageDate };

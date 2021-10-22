const { mockSession } = require('test/fixtures');
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

const moment = require('moment');
const CONF = require('config');

const DATE_FORMAT = CONF.dateFormat;

function enterDesertionDate(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/desertion/when');
  I.fillField('reasonForDivorceDesertionDay', mockSession.reasonForDivorceDesertionDay.toString());
  I.fillField('reasonForDivorceDesertionMonth', mockSession.reasonForDivorceDesertionMonth.toString());
  I.fillField('reasonForDivorceDesertionYear', mockSession.reasonForDivorceDesertionYear.toString());
  I.click(commonContent.continue);
}

function checkDesertionDateOnCYAPage(language = 'en') {
  const I = this;
  I.seeInCurrentUrl('/check-your-answers');

  const seperationDate = `${mockSession.reasonForDivorceDesertionDay}/${mockSession.reasonForDivorceDesertionMonth}/${mockSession.reasonForDivorceDesertionYear}`;
  const seperationDateFormatted = moment(seperationDate, DATE_FORMAT).format('Do MMMM YYYY');

  if (language === 'en') {
    I.see(seperationDateFormatted);
  }
}

module.exports = { enterDesertionDate, checkDesertionDateOnCYAPage };

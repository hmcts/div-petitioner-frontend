const { mockSession } = require('test/fixtures');

const moment = require('moment');
const CONF = require('config');
const DATE_FORMAT = CONF.dateFormat;

function enterDesertionDate() {

  const I = this;

  I.waitUrlEquals('/about-divorce/reason-for-divorce/desertion/when');
  I.fillField('reasonForDivorceDesertionDay', mockSession.reasonForDivorceDesertionDay.toString());
  I.fillField('reasonForDivorceDesertionMonth', mockSession.reasonForDivorceDesertionMonth.toString());
  I.fillField('reasonForDivorceDesertionYear', mockSession.reasonForDivorceDesertionYear.toString());
  I.navByClick('Continue');
}

function checkDesertionDateOnCYAPage() {

  const I = this;

  I.waitUrlEquals('/check-your-answers');

  const seperationDate = `${mockSession.reasonForDivorceDesertionDay}/${mockSession.reasonForDivorceDesertionMonth}/${mockSession.reasonForDivorceDesertionYear}`;
  const seperationDateFormatted = moment(seperationDate, DATE_FORMAT).format('Do MMMM YYYY');
  I.waitForText(seperationDateFormatted);

}

module.exports = { enterDesertionDate, checkDesertionDateOnCYAPage };

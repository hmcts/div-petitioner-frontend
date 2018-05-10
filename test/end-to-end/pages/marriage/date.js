const { mockSession } = require('test/fixtures');

function enterMarriageDate(day = mockSession.marriageDateDay.toString(),
  month = mockSession.marriageDateMonth.toString(),
  year = mockSession.marriageDateYear.toString()) {

  const I = this;

  I.seeCurrentUrlEquals('/about-your-marriage/date-of-marriage-certificate');
  I.fillField('marriageDateDay', day);
  I.fillField('marriageDateMonth', month);
  I.fillField('marriageDateYear', year);
  I.navByClick('Continue');
}

module.exports = { enterMarriageDate };

function enterSeparationDate(day = '1', month = '1', year = '2015') {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/separated');
  I.fillField('reasonForDivorceSeperationDay', day);
  I.fillField('reasonForDivorceSeperationMonth', month);
  I.fillField('reasonForDivorceSeperationYear', year);
  I.navByClick('Continue');
}
module.exports = { enterSeparationDate };
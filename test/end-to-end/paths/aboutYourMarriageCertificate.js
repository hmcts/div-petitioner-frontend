const content = require('app/steps/marriage/about-your-marriage-certificate/content.json').resources.en.translation.content;

Feature('Foreign Marriage Certificates - Certificate Language');

Scenario('Something without promises', function() {
  console.log("SOMETHING");
});

Scenario('Something with arrow', () => {
  console.log("SOMETHING");
});

Scenario('Something with promises', function(I) {
  console.log("SOMETHING");
});

Scenario('Something with arrow', () => {
  console.log("SOMETHING");
});

Scenario('Marriage certificate in English, answered Yes', (I) => {
  I.amOnPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnPage('/about-your-marriage/about-your-marriage-certificate');
  I.checkOption(content.yes);
  I.click('Continue');
  I.seeCurrentUrlEquals('/about-your-marriage/foreign-certificate');
});

Scenario('Marriage certificate not in English, certified translation', (I) => {
  I.amOnPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnPage('/about-your-marriage/about-your-marriage-certificate');
  I.click('#certificateInEnglish_No');
  I.click('#certifiedTranslation_Yes');
  I.click('Continue');
  I.seeCurrentUrlEquals('/about-your-marriage/foreign-certificate');
});


Scenario('Marriage certificate not in English, answered No', (I) => {
  I.amOnPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnPage('/about-your-marriage/about-your-marriage-certificate');
  I.click('#certificateInEnglish_No');
  I.click('#certifiedTranslation_No');
  I.click('Continue');
  I.seeCurrentUrlEquals('/exit/about-your-marriage/no-certificate-translated');
});

Scenario('Married in UK, not answered', (I) => {
  I.amOnPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnPage('/about-your-marriage/about-your-marriage-certificate');
  I.click('Continue');
  I.seeCurrentUrlEquals('/about-your-marriage/about-your-marriage-certificate');
});
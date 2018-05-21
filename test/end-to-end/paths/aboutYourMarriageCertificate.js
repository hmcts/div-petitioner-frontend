const content = require('app/steps/marriage/about-your-marriage-certificate/content.json').resources.en.translation.content;

Feature('Foreign Marriage Certificates - Certificate Language', { retries: 1 });

Scenario('Marriage certificate in English, answered Yes', (I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/about-your-marriage-certificate');
  I.checkOption(content.yes);
  I.navByClick('Continue');
  I.seeCurrentUrlEquals('/about-your-marriage/foreign-certificate');
});

Scenario('Marriage certificate not in English, certified translation', (I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/about-your-marriage-certificate');
  I.click('#certificateInEnglish_No');
  I.click('#certifiedTranslation_Yes');
  I.navByClick('Continue');
  I.seeCurrentUrlEquals('/about-your-marriage/foreign-certificate');
});


Scenario('Marriage certificate not in English, answered No', (I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/about-your-marriage-certificate');
  I.click('#certificateInEnglish_No');
  I.click('#certifiedTranslation_No');
  I.navByClick('Continue');
  I.seeCurrentUrlEquals('/exit/about-your-marriage/no-certificate-translated');
});

Scenario('@overnight: Married in UK, not answered', (I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/about-your-marriage-certificate');
  I.navByClick('Continue');
  I.seeCurrentUrlEquals('/about-your-marriage/about-your-marriage-certificate');
});
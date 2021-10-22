const content = require('app/steps/marriage/about-your-marriage-certificate/content.json').resources.en.translation.content;

Feature('Foreign Marriage Certificates - Certificate Language @functional').retry(3);

Scenario('Marriage certificate in English, answered Yes', I => {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/about-your-marriage-certificate');
  I.checkOption(content.yes);
  I.navByClick('Continue');
  I.seeInCurrentUrl('/about-your-marriage/foreign-certificate');
});

Scenario('Marriage certificate not in English, certified translation', I => {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/about-your-marriage-certificate');
  I.click('#certificateInEnglish_No');
  I.click('#certifiedTranslation_Yes');
  I.navByClick('Continue');
  I.seeInCurrentUrl('/about-your-marriage/foreign-certificate');
});

Scenario('Marriage certificate not in English, answered No', I => {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/about-your-marriage-certificate');
  I.click('#certificateInEnglish_No');
  I.click('#certifiedTranslation_No');
  I.navByClick('Continue');
  I.seeInCurrentUrl('/exit/about-your-marriage/no-certificate-translated');
});

Scenario('Married in UK, not answered @cross-browser-test', I => {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/about-your-marriage-certificate');
  I.navByClick('Continue');
  I.seeInCurrentUrl('/about-your-marriage/about-your-marriage-certificate');
});

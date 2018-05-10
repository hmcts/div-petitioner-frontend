const content = require('app/steps/marriage/about-your-marriage-certificate/content.json').resources.en.translation.content;

function selectMarriageCertificateInEnglish() {

  const I = this;

  I.seeCurrentUrlEquals('/about-your-marriage/about-your-marriage-certificate');
  clickCertificateInEnglish(I, 'Yes');
  I.navByClick('Continue');
}

function selectMarriageCertificateNotEnglishWithTranslation() {

  const I = this;

  I.seeCurrentUrlEquals('/about-your-marriage/about-your-marriage-certificate');
  I.checkOption(content.yes);
  clickCertificateInEnglish(I, 'No');
  clickCertifiedTranslation(I, 'Yes');
  I.navByClick('Continue');
}

function selectMarriageCertificateNotEnglishNoTranslation() {

  const I = this;

  I.seeCurrentUrlEquals('/about-your-marriage/about-your-marriage-certificate');
  I.checkOption(content.yes);
  clickCertificateInEnglish(I, 'No');
  clickCertifiedTranslation(I, 'No');
  I.navByClick('Continue');
}


function clickCertificateInEnglish(I, value) {
  I.click(`#certificateInEnglish_${value}`);

}

function clickCertifiedTranslation(I, value) {
  I.click(`#certifiedTranslation_${value}`);

}

module.exports = {
  selectMarriageCertificateInEnglish,
  selectMarriageCertificateNotEnglishWithTranslation,
  selectMarriageCertificateNotEnglishNoTranslation
};
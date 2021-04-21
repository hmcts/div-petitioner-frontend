/* eslint-disable no-console */
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;
const pagePath = '/petitioner-respondent/marriage-certificate-upload';

function uploadMarriageCertificateFile(language = 'en', isDragAndDropSupported) {
  // eslint-disable-next-line no-console
  // const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);

  if (language === 'en') {
    I.say('Drag and Drop supported: ' + isDragAndDropSupported);
    upload(I, '/assets/image.jpg', isDragAndDropSupported);
    I.waitForText('Remove', 30);
    I.waitForVisible('input[value="Continue"]:not([disabled])');
  }
  // I.navByClick(commonContent.continue);
}

function testUploadResponse(isDragAndDropSupported, assetPath) {//TODO - when is this used
  const I = this;

  I.seeInCurrentUrl(pagePath);
  upload(I, assetPath, isDragAndDropSupported);
  I.waitForVisible('input[value="Continue"]:not([disabled])', 60);
}

function deleteMarriageCertificateFile(isDragAndDropSupported) {
  const I = this;

  I.say('Drag and Drop supported: ' + isDragAndDropSupported);//TODO - I think this does the same as the upload function
  I.seeInCurrentUrl(pagePath);
  upload(I, '/assets/image.jpg', isDragAndDropSupported);
  I.waitForText('Remove', 30);
  I.click('Remove');
  I.navByClick('Continue');
}

function withoutUploadFile(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);

  if (language === 'en') {
    I.see('No files uploaded');
    I.navByClick(commonContent.continue);
  } else {
    I.navByClick(commonContent.continue);
  }

}

function upload(I, file, isDragAndDropSupported) {
  if (isDragAndDropSupported) {
    I.attachFile('.dz-message-copy', file);
  }
  else {
    I.waitForVisible('.file-upload-input');//This is the issue
    I.attachFile('.file-upload-input', file);
    I.click('Upload');
  }
}

module.exports = {
  uploadMarriageCertificateFile,
  deleteMarriageCertificateFile,
  testUploadResponse,
  withoutUploadFile
};

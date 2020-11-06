const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function upload(file, isDragAndDropSupported) {
  const I = this;

  if (isDragAndDropSupported) {
    I.attachFile('.dz-hidden-input', file);
  }
  else {
    I.waitForVisible('.file-upload-input');
    I.attachFile('.file-upload-input', file);
    I.click('Upload');
  }
}

function uploadMarriageCertificateFile(language = 'en', isDragAndDropSupported) {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  if (language === 'en') {
    I.say('Drag and Drop supported: ' + isDragAndDropSupported);
    I.seeInCurrentUrl('/petitioner-respondent/marriage-certificate-upload');
    upload.call(I, '/assets/image.jpg', isDragAndDropSupported);
    I.waitForVisible('.file', 30);
    I.waitForText('Remove', 30);
    I.waitForVisible('input[value="Continue"]:not([disabled])');
    I.navByClick(commonContent.continue);
  } else {
    I.seeInCurrentUrl('/petitioner-respondent/marriage-certificate-upload');
    I.navByClick(commonContent.continue);
    // I.withoutUploadFile('cy');
  }
}

function testUploadResponse(isDragAndDropSupported, assetPath) {
  const I = this;

  I.seeInCurrentUrl('/petitioner-respondent/marriage-certificate-upload');
  upload.call(I, assetPath, isDragAndDropSupported);
  I.waitForVisible('input[value="Continue"]:not([disabled])', 60);
}

function deleteAMarriageCertificateFile(isDragAndDropSupported) {
  const I = this;

  I.say('Drag and Drop supported: ' + isDragAndDropSupported);
  I.seeInCurrentUrl('/petitioner-respondent/marriage-certificate-upload');
  upload.call(I, '/assets/image.jpg', isDragAndDropSupported);
  I.waitForVisible('.file', 30);
  I.waitForText('Remove', 30);
  I.click('Remove');
  I.waitForInvisible('.file');
  I.dontSee('Remove');
  I.navByClick('Continue');
}

function withoutUploadFile(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.seeInCurrentUrl('/petitioner-respondent/marriage-certificate-upload');

  if (language === 'en') {
    I.see('No files uploaded');
    I.navByClick(commonContent.continue);
  } else {
    I.navByClick(commonContent.continue);
  }

}

module.exports = {
  uploadMarriageCertificateFile,
  deleteAMarriageCertificateFile,
  testUploadResponse,
  withoutUploadFile
};

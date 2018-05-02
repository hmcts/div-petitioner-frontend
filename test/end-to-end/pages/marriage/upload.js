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

function uploadMarriageCertificateFile(isDragAndDropSupported) {
  const I = this;

  I.seeCurrentUrlEquals('/petitioner-respondent/marriage-certificate-upload');
  upload.call(I, '/assets/image.jpg', isDragAndDropSupported);
  I.waitForVisible('.file', 30);
  I.waitForText('Remove', 30);
  I.waitForVisible('input[value="Continue"]:not([disabled])');
  I.click('Continue');
}

function testUploadResponse(isDragAndDropSupported, assetPath) {
  const I = this;

  I.seeCurrentUrlEquals('/petitioner-respondent/marriage-certificate-upload');
  upload.call(I, assetPath, isDragAndDropSupported);
  I.waitForVisible('input[value="Continue"]:not([disabled])', 60);
}

function deleteAMarriageCertificateFile(isDragAndDropSupported) {
  const I = this;

  I.seeCurrentUrlEquals('/petitioner-respondent/marriage-certificate-upload');
  upload.call(I, '/assets/image.jpg', isDragAndDropSupported);
  I.waitForVisible('.file', 30);
  I.waitForText('Remove', 30);
  I.click('Remove');
  I.waitForInvisible('.file');
  I.dontSee('Remove');
  I.click('Continue');
}

module.exports = {
  uploadMarriageCertificateFile,
  deleteAMarriageCertificateFile,
  testUploadResponse
};

Feature('Upload Marriage Certificate');

Scenario('Test upload', function* (I) {
  I.amOnPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnPage('/petitioner-respondent/marriage-certificate-upload');
  const isDragAndDropSupported = yield I.checkElementExist('.dz-hidden-input');
  I.uploadMarriageCertificateFile(isDragAndDropSupported);
});

Scenario('Test remove marriage Certificate', function* (I) {
  I.amOnPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnPage('/petitioner-respondent/marriage-certificate-upload');
  const isDragAndDropSupported = yield I.checkElementExist('.dz-hidden-input');
  I.deleteAMarriageCertificateFile(isDragAndDropSupported);
});

Scenario('Test ability validate document type', function* (I) {
  I.amOnPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnPage('/petitioner-respondent/marriage-certificate-upload');

  const isDragAndDropSupported = yield I.checkElementExist('.dz-hidden-input');

  if(isDragAndDropSupported){
    // Test can upload .pdf
    I.testUploadResponse(isDragAndDropSupported, '/assets/image.pdf');
    I.dontSee('The file must be in jpg, bmp, tiff, png or PDF format.');

    // Test can upload .png
    I.testUploadResponse(isDragAndDropSupported, '/assets/image.png');
    I.dontSee('The file must be in jpg, bmp, tiff, png or PDF format.');

    // Test can upload .bmp
    I.testUploadResponse(isDragAndDropSupported, '/assets/image.bmp');
    I.dontSee('The file must be in jpg, bmp, tiff, png or PDF format.');

    // Test can upload .tiff
    I.testUploadResponse(isDragAndDropSupported, '/assets/image.tiff');
    I.dontSee('The file must be in jpg, bmp, tiff, png or PDF format.');

    // Test can NOT upload .zip
    I.testUploadResponse(isDragAndDropSupported, '/assets/image.zip');
    I.see('The file must be in jpg, bmp, tiff, png or PDF format.');
  } else {
    I.say('JS upload disabled - skipping');
  }
});
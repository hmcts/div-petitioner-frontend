const content = require('app/steps/marriage/upload/content.json').resources.en.translation.content;

Feature('Upload Marriage Certificate', { retries: 1 });

Scenario('Test upload', function* (I) {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/petitioner-respondent/marriage-certificate-upload');
  const isDragAndDropSupported = yield I.checkElementExist('.dz-hidden-input');
  I.uploadMarriageCertificateFile(isDragAndDropSupported);
});

Scenario('Test remove marriage Certificate', function* (I) {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/petitioner-respondent/marriage-certificate-upload');
  const isDragAndDropSupported = yield I.checkElementExist('.dz-hidden-input');
  I.deleteAMarriageCertificateFile(isDragAndDropSupported);
});

Scenario('Test ability validate document type', function* (I) {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/petitioner-respondent/marriage-certificate-upload');

  const isDragAndDropSupported = yield I.checkElementExist('.dz-hidden-input');

  if(isDragAndDropSupported){
    // Test can upload .pdf
    I.testUploadResponse(isDragAndDropSupported, '/assets/test_pdf.pdf');
    I.dontSee(content.errorUnknown);
    I.dontSee(content.errorFileTypeInvalid);

    // Test can upload .png
    I.testUploadResponse(isDragAndDropSupported, '/assets/test_png.png');
    I.dontSee(content.errorUnknown);
    I.dontSee(content.errorFileTypeInvalid);

    // Test can upload .bmp
    I.testUploadResponse(isDragAndDropSupported, '/assets/test_bmp.bmp');
    I.dontSee(content.errorUnknown);
    I.dontSee(content.errorFileTypeInvalid);

    // Test can upload .tiff
    I.testUploadResponse(isDragAndDropSupported, '/assets/test_tif.tif');
    I.dontSee(content.errorUnknown);
    I.dontSee(content.errorFileTypeInvalid);

    // Test can NOT upload .zip
    I.testUploadResponse(isDragAndDropSupported, '/assets/image.zip');
    I.see(content.errorFileTypeInvalid);
  } else {
    I.say('JS upload disabled - skipping');
  }
});
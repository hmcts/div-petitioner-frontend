const content = require('app/steps/marriage/upload/content.json').resources.en.translation.content;
const language = 'en';

Feature('Upload Marriage Certificate').retry(5);

Scenario('Test upload remove marriage Certificate', async function (I) {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/petitioner-respondent/marriage-certificate-upload');
  const isDragAndDropSupported = await I.checkElementExist('.dz-hidden-input');
  I.uploadMarriageCertificateFile(language, isDragAndDropSupported);
  I.click('Back');
  I.deleteMarriageCertificateFile(isDragAndDropSupported);
});

Scenario('Test ability validate document type', async function (I) {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/petitioner-respondent/marriage-certificate-upload');

  const isDragAndDropSupported = await I.checkElementExist('.dz-hidden-input');

  if(isDragAndDropSupported) {
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

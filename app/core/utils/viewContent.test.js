const { expect } = require('test/util/chai');
const { remove } = require('lodash');

const modulePath = 'app/core/utils/viewContent';
const underTest = require(modulePath);

const sessionData = {
  d8: [
    {
      id: '0ecc2507-1acf-46ae-b0d8-2d7c032fc145',
      createdBy: 0,
      createdOn: null,
      lastModifiedBy: 0,
      modifiedOn: null,
      fileName: 'd8petition1594218147343642.pdf',
      fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/0ecc2507-1acf-46ae-b0d8-2d7c032fc145',
      mimeType: null,
      status: null
    },
    {
      id: '27387e86-7fb8-4b72-8786-64ea22cb746d',
      createdBy: 0,
      createdOn: null,
      lastModifiedBy: 0,
      modifiedOn: null,
      fileName: 'GeneralOrders.pdf',
      fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/27387e86-7fb8-4b72-8786-64ea22cb746d',
      mimeType: null,
      status: null
    },
    {
      id: '27387e86-7fb8-4b72-8786-64ea22cb746d',
      createdBy: 0,
      createdOn: null,
      lastModifiedBy: 0,
      modifiedOn: null,
      fileName: 'DeemedServiceRefused1594218147343643.pdf',
      fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/27387e86-7fb8-4b72-8786-64ea22cb746d',
      mimeType: null,
      status: null
    },
    {
      id: '401ab79e-34cb-4570-9f2f-4cf9357m4st3r',
      createdBy: 0,
      createdOn: null,
      lastModifiedBy: 0,
      modifiedOn: null,
      fileName: 'documentNotWhiteListed1554740111371638.pdf',
      fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/30acaa2f-84d7-4e27-adb3-69551560113f',
      mimeType: null,
      status: null
    },
    {
      id: '27387e86-7fb8-4b72-8786-64ea22cb746d',
      createdBy: 0,
      createdOn: null,
      lastModifiedBy: 0,
      modifiedOn: null,
      fileName: 'GeneralOrders.pdf',
      fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/27387e86-7fb8-4b72-8786-64ea22cb746d',
      mimeType: null,
      status: null
    }
  ]
};
const getOnlyFileType = (fileTypes, typeName) => {
  return remove(fileTypes, fileType => {
    return fileType !== typeName;
  });
};

const EMPTY_LIST_SIZE = 0;

describe(`Suite: ${modulePath}`, () => {
  describe('Downloadable Documents', () => {
    it('should return an empty array when no d8 property exists', () => {
      const downloadableFiles = underTest.getDownloadableFiles({});
      expect(downloadableFiles).lengthOf(EMPTY_LIST_SIZE);
    });

    it('should return an empty array when no documents items exists', () => {
      const downloadableFiles = underTest.getDownloadableFiles({ d8: [] });
      expect(downloadableFiles).lengthOf(EMPTY_LIST_SIZE);
    });

    it('should contain only whitelisted documents', () => {
      const fileTypes = underTest.getDownloadableFiles(sessionData)
        .map(file => {
          return file.type;
        });

      expect(fileTypes).to.include('dpetition');
      expect(fileTypes).to.include('DeemedServiceRefused');
      expect(fileTypes).to.include('GeneralOrders');
      expect(fileTypes).to.not.include('documentNotWhiteListed');
    });

    it('should return multiple documents of specific type if available', () => {
      const expectedDocumentsSize = 4;
      const expectedGeneralOrderDocumentsSize = 2;

      const fileTypes = underTest.getDownloadableFiles(sessionData)
        .map(file => {
          return file.type;
        });

      expect(fileTypes).to.have.lengthOf(expectedDocumentsSize);
      expect(fileTypes).to.include('dpetition');
      expect(fileTypes).to.include('DeemedServiceRefused');
      expect(fileTypes).to.include('GeneralOrders');
      expect(getOnlyFileType(fileTypes, 'GeneralOrders')).to.have.lengthOf(expectedGeneralOrderDocumentsSize);
    });
  });
});

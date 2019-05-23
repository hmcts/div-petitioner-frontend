/* eslint-disable no-magic-numbers */
const { expect } = require('test/util/chai');
const rewire = require('rewire');

const modulePath = 'app/components/AddressLookupStep/helpers/addressHelpers';
const underTest = rewire(modulePath);
const testAddresses = require('../mocks/responses/testpostcode.json');

describe(modulePath, () => {
  let buildNameIsAnException = '';
  let splitTfaresLocalities = '';
  let orderedTfaresLocalities = '';
  let defaultAddressTemplate = '';
  let buildAddressLines = '';

  function templateAddressAt(index) {
    return defaultAddressTemplate(testAddresses[index]);
  }

  before(() => {
    buildNameIsAnException = underTest.__get__('buildNameIsAnException');
    splitTfaresLocalities = underTest.__get__('splitTfaresLocalities');
    orderedTfaresLocalities = underTest.__get__('orderedTfaresLocalities');
    defaultAddressTemplate = underTest.__get__('defaultAddressTemplate');
    buildAddressLines = underTest.__get__('buildAddressLines');
  });

  describe('buildNameIsAnException', () => {
    it('should correctly return whether a string matches the exception criteria', () => {
      const exceptionNames = ['3', '12', '1237', '12-19', '13A', '112B', 'B', 'D', 'S'];
      const nonExceptionNames = ['The Manor', 'Britney Spears Tower', 'Flat 2', 'APT.15', 'Apartment 23', 'Parade Close', 'Circus'];

      exceptionNames.forEach(
        elem => {
          return expect(buildNameIsAnException(elem)).to.be.true;
        });

      nonExceptionNames.forEach(
        elem => {
          return expect(buildNameIsAnException(elem)).to.be.false;
        });
    });
  });

  describe('splitTfaresLocalities', () => {
    let splitLines = {};
    let expectedObject = {};
    let tfaresLocalities = [];

    beforeEach(() => {
      expectedObject = {};
      splitLines = {};
      tfaresLocalities = [];
    });

    describe('should correctly extract', () => {
      // indices of addresses containing the desired components
      const addressIndicesLocality = [0, 1, 5, 7];
      const addressIndicesThName = [2];

      it('a single locality to the first line', () => {
        // eslint-disable-next-line max-nested-callbacks
        addressIndicesLocality.forEach(i => {
          tfaresLocalities = orderedTfaresLocalities(templateAddressAt(i));
          splitLines = splitTfaresLocalities(tfaresLocalities);
          expectedObject = {
            firstLine: testAddresses[i].DPA.DEPENDENT_LOCALITY,
            otherLines: ''
          };
          return expect(splitLines).to.deep.equal(expectedObject);
        });
      });

      it('a single thoroughfare to the first line', () => {
        // eslint-disable-next-line max-nested-callbacks
        addressIndicesThName.forEach(i => {
          tfaresLocalities = orderedTfaresLocalities(templateAddressAt(i));
          splitLines = splitTfaresLocalities(tfaresLocalities);
          expectedObject = {
            firstLine: testAddresses[i].DPA.THOROUGHFARE_NAME,
            otherLines: ''
          };
          return expect(splitLines).to.deep.equal(expectedObject);
        });
      });

      it('all localities in the given order', () => {
        tfaresLocalities = orderedTfaresLocalities(templateAddressAt(3));
        splitLines = splitTfaresLocalities(tfaresLocalities);
        expectedObject = {
          firstLine: testAddresses[3].DPA.DOUBLE_DEPENDENT_LOCALITY,
          otherLines: testAddresses[3].DPA.DEPENDENT_LOCALITY
        };
        expect(splitLines).to.deep.equal(expectedObject);
      });

      it('multiple localities and thoroughfares in the given order', () => {
        tfaresLocalities = orderedTfaresLocalities(templateAddressAt(9));
        splitLines = splitTfaresLocalities(tfaresLocalities);
        expectedObject = {
          firstLine: testAddresses[9].DPA.DEPENDENT_THOROUGHFARE_NAME,
          otherLines: `${testAddresses[9].DPA.THOROUGHFARE_NAME} ${testAddresses[9].DPA.DEPENDENT_LOCALITY}`
        };
        expect(splitLines).to.deep.equal(expectedObject);
      });

      it('all localities/thoroughfares in the given order', () => {
        tfaresLocalities = orderedTfaresLocalities(templateAddressAt(13));
        splitLines = splitTfaresLocalities(tfaresLocalities);
        expectedObject = {
          firstLine: testAddresses[13].DPA.DEPENDENT_THOROUGHFARE_NAME,
          otherLines: `${testAddresses[13].DPA.THOROUGHFARE_NAME} ${testAddresses[13].DPA.DOUBLE_DEPENDENT_LOCALITY} ${testAddresses[13].DPA.DEPENDENT_LOCALITY}`
        };
        expect(splitLines).to.deep.equal(expectedObject);
      });
    });
  });

  describe('buildAddressLines', () => {
    let expectedAddress = [];
    beforeEach(() => {
      expectedAddress = [];
    });

    describe('builds an address in the correct format given', () => {
      it('an organisation name', () => {
        const addressArg1 = testAddresses[0];
        expectedAddress.push(addressArg1.DPA.ORGANISATION_NAME);
        expectedAddress.push(addressArg1.DPA.DEPENDENT_LOCALITY);
        expect(buildAddressLines(addressArg1)).to.deep.equal(expectedAddress);
      });

      it('an organisation and department name, along with a PO BOX number', () => {
        const addressArg1 = testAddresses[1];
        expectedAddress.push(`${addressArg1.DPA.ORGANISATION_NAME} ${addressArg1.DPA.DEPARTMENT_NAME} ${addressArg1.DPA.PO_BOX_NUMBER}`);
        expectedAddress.push(addressArg1.DPA.DEPENDENT_LOCALITY);
        expect(buildAddressLines(addressArg1)).to.deep.equal(expectedAddress);
      });

      it('all possible address components including organisation details', () => {
        const addressArg1 = testAddresses[13];
        expectedAddress.push(`${addressArg1.DPA.ORGANISATION_NAME} ${addressArg1.DPA.DEPARTMENT_NAME}`);
        const secondLinePartOne = `${addressArg1.DPA.SUB_BUILDING_NAME} ${addressArg1.DPA.BUILDING_NAME}`;
        const secondLinePartTwo = `${addressArg1.DPA.BUILDING_NUMBER} ${addressArg1.DPA.DEPENDENT_THOROUGHFARE_NAME}`;
        const thirdLine = `${addressArg1.DPA.THOROUGHFARE_NAME} ${addressArg1.DPA.DOUBLE_DEPENDENT_LOCALITY} ${addressArg1.DPA.DEPENDENT_LOCALITY}`;
        expectedAddress.push(`${secondLinePartOne} ${secondLinePartTwo}`);
        expectedAddress.push(thirdLine);
        expect(buildAddressLines(addressArg1)).to.deep.equal(expectedAddress);
      });

      it('a building number and thoroughfare', () => {
        const addressArg1 = testAddresses[2];
        expectedAddress.push(`${addressArg1.DPA.BUILDING_NUMBER} ${addressArg1.DPA.THOROUGHFARE_NAME}`);
        expect(buildAddressLines(addressArg1)).to.deep.equal(expectedAddress);
      });

      it('a building number and localities', () => {
        const addressArg1 = testAddresses[3];
        expectedAddress.push(`${addressArg1.DPA.BUILDING_NUMBER} ${addressArg1.DPA.DOUBLE_DEPENDENT_LOCALITY} ${addressArg1.DPA.DEPENDENT_LOCALITY}`);
        expect(buildAddressLines(addressArg1)).to.deep.equal(expectedAddress);
      });

      it('a building name which is an exception', () => {
        const addressArg1 = testAddresses[4];
        expectedAddress.push(`${addressArg1.DPA.BUILDING_NAME} ${addressArg1.DPA.DEPENDENT_THOROUGHFARE_NAME}`);
        expectedAddress.push(`${addressArg1.DPA.THOROUGHFARE_NAME}`);
        expect(buildAddressLines(addressArg1)).to.deep.equal(expectedAddress);
      });

      it('a building name which is not an exception', () => {
        const addressArg1 = testAddresses[5];
        expectedAddress.push(addressArg1.DPA.BUILDING_NAME);
        expectedAddress.push(addressArg1.DPA.DEPENDENT_LOCALITY);
        expect(buildAddressLines(addressArg1)).to.deep.equal(expectedAddress);
      });

      it('a building name and building number', () => {
        const addressArg1 = testAddresses[6];
        expectedAddress.push(addressArg1.DPA.BUILDING_NAME);
        expectedAddress.push(`${addressArg1.DPA.BUILDING_NUMBER} ${addressArg1.DPA.THOROUGHFARE_NAME}`);
        expect(buildAddressLines(addressArg1)).to.deep.equal(expectedAddress);
      });

      it('a sub-building name and building number', () => {
        const addressArg1 = testAddresses[7];
        expectedAddress.push(addressArg1.DPA.SUB_BUILDING_NAME);
        expectedAddress.push(`${addressArg1.DPA.BUILDING_NUMBER} ${addressArg1.DPA.DEPENDENT_LOCALITY}`);
        expect(buildAddressLines(addressArg1)).to.deep.equal(expectedAddress);
      });

      it('a sub-building name which is an exception and a building name', () => {
        const addressArg1 = testAddresses[8];
        expectedAddress.push(`${addressArg1.DPA.SUB_BUILDING_NAME} ${addressArg1.DPA.BUILDING_NAME}`);
        expectedAddress.push(addressArg1.DPA.THOROUGHFARE_NAME);
        expectedAddress.push(addressArg1.DPA.DEPENDENT_LOCALITY);
        expect(buildAddressLines(addressArg1)).to.deep.equal(expectedAddress);
      });

      it('a sub-building name and a building name which is an exception', () => {
        const addressArg1 = testAddresses[9];
        expectedAddress.push(`${addressArg1.DPA.SUB_BUILDING_NAME}`);
        expectedAddress.push(`${addressArg1.DPA.BUILDING_NAME} ${addressArg1.DPA.DEPENDENT_THOROUGHFARE_NAME}`);
        expectedAddress.push(`${addressArg1.DPA.THOROUGHFARE_NAME} ${addressArg1.DPA.DEPENDENT_LOCALITY}`);
        expect(buildAddressLines(addressArg1)).to.deep.equal(expectedAddress);
      });

      it('a sub-building name and a building name both of which are exceptions', () => {
        const addressArg1 = testAddresses[10];
        expectedAddress.push(`${addressArg1.DPA.SUB_BUILDING_NAME} ${addressArg1.DPA.BUILDING_NAME} ${addressArg1.DPA.THOROUGHFARE_NAME}`);
        expectedAddress.push(`${addressArg1.DPA.DEPENDENT_LOCALITY}`);
        expect(buildAddressLines(addressArg1)).to.deep.equal(expectedAddress);
      });

      it('a sub-building name which is an exception, a building name, and a building number', () => {
        const addressArg1 = testAddresses[11];
        expectedAddress.push(`${addressArg1.DPA.SUB_BUILDING_NAME} ${addressArg1.DPA.BUILDING_NAME}`);
        expectedAddress.push(`${addressArg1.DPA.BUILDING_NUMBER} ${addressArg1.DPA.THOROUGHFARE_NAME}`);
        expectedAddress.push(`${addressArg1.DPA.DOUBLE_DEPENDENT_LOCALITY} ${addressArg1.DPA.DEPENDENT_LOCALITY}`);
        expect(buildAddressLines(addressArg1)).to.deep.equal(expectedAddress);
      });

      it('a sub-building name, a building name, and a building number', () => {
        const addressArg1 = testAddresses[12];
        expectedAddress.push(`${addressArg1.DPA.SUB_BUILDING_NAME}`);
        expectedAddress.push(`${addressArg1.DPA.BUILDING_NAME}`);
        expectedAddress.push(`${addressArg1.DPA.BUILDING_NUMBER} ${addressArg1.DPA.THOROUGHFARE_NAME}`);
        expect(buildAddressLines(addressArg1)).to.deep.equal(expectedAddress);
      });

      it('a building number and a thoroughfare name', () => {
        const addressArg1 = testAddresses[14];
        expectedAddress.push(`${addressArg1.DPA.BUILDING_NUMBER} ${addressArg1.DPA.THOROUGHFARE_NAME}`);
        expect(buildAddressLines(addressArg1)).to.deep.equal(expectedAddress);
      });

      it('a sub-building name and building number', () => {
        const addressArg1 = testAddresses[15];
        expectedAddress.push(addressArg1.DPA.SUB_BUILDING_NAME);
        expectedAddress.push(`${addressArg1.DPA.BUILDING_NUMBER} ${addressArg1.DPA.THOROUGHFARE_NAME}`);
        expect(buildAddressLines(addressArg1)).to.deep.equal(expectedAddress);
      });
    });
  });
});
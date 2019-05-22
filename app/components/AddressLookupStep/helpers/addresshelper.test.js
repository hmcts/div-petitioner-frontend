const { expect } = require('test/util/chai');
const rewire = require('rewire');

const modulePath = 'app/components/AddressLookupStep/helpers/addressHelpers';
const underTest = rewire(modulePath);
const testAddresses = require('./responses/testpostcode.json');

// eslint-disable-next-line mocha/no-exclusive-tests
describe.only(modulePath, () => {
  const buildNameIsAnException = underTest.__get__('buildNameIsAnException');

  it('should return correctly whether a string matches the exception criteria', () => {
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
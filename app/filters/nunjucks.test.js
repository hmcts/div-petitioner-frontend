/* eslint-disable no-magic-numbers */
const { expect } = require('test/util/chai');
const nunjucksFilters = require('app/filters/nunjucks');

describe('Nunjucks insert hyphen filter', () => {
  it('should add space hyphen space after each 4th character, but not at the end', () => {
    const filteredString = nunjucksFilters.insertHyphens('1509031793780148');
    expect(filteredString).to.equal('1509 &#8208; 0317 &#8208; 9378 &#8208; 0148');
  });
  it('should add space hyphen space after each 4th character, but not at the end if value is numerical', () => {
    const caseIdNumber = 1509031793780148;
    const filteredString = nunjucksFilters.insertHyphens(caseIdNumber);
    expect(filteredString).to.equal('1509 &#8208; 0317 &#8208; 9378 &#8208; 0148');
  });
});

describe('a11yCharSeparator', () => {
  it('should return string formatted', () => {
    const filteredString = nunjucksFilters.a11yCharSeparator('ABC1234');
    const expectedResult = 'A B C 1 2 3 4';
    expect(filteredString).to.eql(expectedResult);
  });
  it('should return string formatted correctly when there is whitespace in the string', () => {
    const filteredString = nunjucksFilters.a11yCharSeparator('  ABC1    234        ');
    const expectedResult = 'A B C 1 2 3 4';
    expect(filteredString).to.eql(expectedResult);
  });
  it('should handle an empty string', () => {
    const filteredString = nunjucksFilters.a11yCharSeparator('');
    const expectedResult = '';
    expect(filteredString).to.eql(expectedResult);
  });
  it('should handle a null value', () => {
    const filteredString = nunjucksFilters.a11yCharSeparator(null);
    const expectedResult = null;
    expect(filteredString).to.eql(expectedResult);
  });
  it('should handle a number value', () => {
    const filteredString = nunjucksFilters.a11yCharSeparator(1234);
    const expectedResult = 1234;
    expect(filteredString).to.eql(expectedResult);
  });
});

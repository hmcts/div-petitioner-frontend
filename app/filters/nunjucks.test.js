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
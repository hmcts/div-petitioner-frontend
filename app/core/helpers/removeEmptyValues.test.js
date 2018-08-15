const { expect } = require('test/util/chai');

const modulePath = 'app/core/helpers/removeEmptyValues';

const removeEmptyValues = require(modulePath);

describe(modulePath, () => {
  it('removes empty values from object', () => {
    const ctx = {
      value1: 'value1',
      value2: '',
      value3: ' ',
      value4: '   '
    };
    const newCtx = removeEmptyValues(ctx);
    expect(newCtx.hasOwnProperty('value2')).to.eql(false);
    expect(newCtx.hasOwnProperty('value3')).to.eql(false);
    expect(newCtx.hasOwnProperty('value4')).to.eql(false);
  });
});

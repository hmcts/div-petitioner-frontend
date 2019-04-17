const modulePath = 'app/core/utils/capitalizeName';
const capitalizeName = require(modulePath);

const { expect } = require('test/util/chai');

describe(modulePath, () => {
  it('should capitalize the name correctly', () => {
    expect('Petitioner First O\'Martin O-Neil', capitalizeName('petitioner first o\'martin o-neil'));
  });
});

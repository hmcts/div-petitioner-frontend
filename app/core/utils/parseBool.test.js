const modulePath = 'app/core/utils/parseBool';
const parseBool = require(modulePath);

const { expect } = require('test/util/chai');

describe(modulePath, () => {
  it('should return true when given boolean true', () => {
    expect(true, parseBool(true));
  });

  it('should return true when given string true', () => {
    expect(true, parseBool('true'));
  });
  
  it('should return true when given integer 1', () => {
    expect(true, parseBool(1));
  });

  it('should return false when given boolean false', () => {
    expect(false, parseBool(false));
  });

  it('should return false when given string false', () => {
    expect(false, parseBool('false'));
  });
  
  it('should return false when given integer 0', () => {
    expect(false, parseBool(0));
  });

  it('should return false when given a random string', () => {
    expect(false, parseBool('random string'));
  });
});

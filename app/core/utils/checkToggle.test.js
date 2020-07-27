const { isToggleOnAwaitingAmend } = require('app/core/utils/checkToggle');

const { expect } = require('test/util/chai');

describe('checkToggle', () => {
  it('should return true when toggle is on', () => {
    const session = {
      featureToggles: { ft_awaiting_amend: true }
    };
    expect(isToggleOnAwaitingAmend(session)).to.equal(true);
  });

  it('should return false when toggle is off', () => {
    const session = {
      featureToggles: { ft_awaiting_amend: false }
    };
    expect(isToggleOnAwaitingAmend(session)).to.equal(false);
  });

  it('should return false when toggle does not exist in session', () => {
    const session = {};
    expect(isToggleOnAwaitingAmend(session)).to.equal(false);
  });
});

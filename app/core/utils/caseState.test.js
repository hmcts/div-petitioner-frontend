const modulePath = 'app/core/utils/caseState';

const { isAwaitingAmendCase } = require(modulePath);

const { expect } = require('test/util/chai');

describe(modulePath, () => {
  it('should return true when case state exists', () => {
    const session = {
      state: 'AwaitingAmendCase'
    };
    expect(true, isAwaitingAmendCase(session));
  });

  it('should return false when case state does not exists', () => {
    const session = {
      helpWithFeesNeedHelp: 'Yes'
    };
    expect(false, isAwaitingAmendCase(session));
  });

  it('should return false when case state exists but is empty', () => {
    const session = {
      state: ''
    };
    expect(false, isAwaitingAmendCase(session));
  });
});

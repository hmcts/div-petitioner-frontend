const modulePath = 'app/core/utils/caseState';

const { caseInState, caseStates } = require(modulePath);

const { expect } = require('test/util/chai');

describe(modulePath, () => {
  it('should return true when case state exists', () => {
    const session = {
      state: 'AwaitingAmendCase'
    };
    expect(true, caseInState(session, caseStates.AwaitingAmendCase));
  });

  it('should return false when case state does not exists', () => {
    const session = {
      helpWithFeesNeedHelp: 'Yes'
    };
    expect(false, caseInState(session, caseStates.AwaitingAmendCase));
  });

  it('should return false when case state exists but is empty', () => {
    const session = {
      state: ''
    };
    expect(false, caseInState(session, caseStates.AwaitingAmendCase));
  });
});

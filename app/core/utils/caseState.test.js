const { isAwaitingAmendCase } = require('app/core/utils/caseState');

const { expect } = require('test/util/chai');

describe('caseState', () => {
  describe('isAwaitingAmendCase', () => {
    it('should return true when case state exists and toggle is on', () => {
      const session = {
        state: 'AwaitingAmendCase',
        featureToggles: { ft_awaiting_amend: true }
      };
      expect(isAwaitingAmendCase(session)).to.equal(true);
    });

    it('should return false when case state exists and toggle is off', done => {
      const session = {
        state: 'AwaitingAmendCase',
        featureToggles: { ft_awaiting_amend: false }
      };
      expect(isAwaitingAmendCase(session)).to.equal(false);
      done();
    });

    it('should return false when case state does not exists and if toggle is on', () => {
      const session = {
        helpWithFeesNeedHelp: 'Yes',
        featureToggles: { ft_awaiting_amend: true }
      };
      expect(isAwaitingAmendCase(session)).to.equal(false);
    });

    it('should return false when case state exists but is empty  and if toggle is on', () => {
      const session = {
        state: '',
        featureToggles: { ft_awaiting_amend: true }
      };
      expect(isAwaitingAmendCase(session)).to.equal(false);
    });
  });
});

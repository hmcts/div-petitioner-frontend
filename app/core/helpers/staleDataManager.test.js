const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/core/helpers/staleDataManager';

const staleDataManager = require(modulePath);

describe(modulePath, () => {
  describe('watch', () => {
    beforeEach(done => {
      staleDataManager._reset();
      done();
    });

    it('should add a single key to the watch list', () => {
      staleDataManager.watch('key');
      expect(Object.keys(staleDataManager._watches())).to.contain('key');
    });

    it('should add multiple keys to the watch list', () => {
      staleDataManager.watch(['key1', 'key2']);

      expect(Object.keys(staleDataManager._watches())).to.contain('key1');
      expect(Object.keys(staleDataManager._watches())).to.contain('key2');
    });

    it('should only add one instance of a key to the watches', () => {
      staleDataManager.watch('key');
      staleDataManager.watch('key');

      expect(Object.keys(staleDataManager._watches()).length).to.equal(1);
    });
  });

  describe('execute callbacks for watched fields', () => {
    const TWO_CALLS = 2;

    beforeEach(done => {
      staleDataManager._reset();
      done();
    });

    it('should not trigger a callback if item not changed', () => {
      const session = { key: 'value' };

      const staleDataCallback = sinon.stub();
      staleDataManager.watch('key', staleDataCallback);

      staleDataManager.removeStaleData({ key: 'value' }, session);
      expect(staleDataCallback.callCount).to.equal(0);
    });

    it('should trigger a callback if item changed', () => {
      const session = { key: 'value' };

      const staleDataCallback = sinon.stub();
      staleDataManager.watch('key', staleDataCallback);

      staleDataManager.removeStaleData({ key: 'VALUE' }, session);
      expect(staleDataCallback.callCount).to.equal(1);
    });

    it('should trigger a callback if item removed', () => {
      const session = { key: 'value' };

      const staleDataCallback = sinon.stub();
      staleDataManager.watch('key', staleDataCallback);

      staleDataManager.removeStaleData({}, session);
      expect(staleDataCallback.callCount).to.equal(1);
    });

    it('should trigger callback for each key added as an array', () => {
      const previousSession = {};

      const session = {
        key: 'value',
        key2: 'value'
      };

      const staleDataCallback = sinon.stub();
      staleDataManager.watch(['key', 'key2'], staleDataCallback);

      staleDataManager.removeStaleData(previousSession, session);

      expect(staleDataCallback.callCount).to.equal(TWO_CALLS);
    });

    it('should trigger callback for each key added seperatly', () => {
      const session = {
        key: 'value',
        key2: 'value'
      };

      const staleDataCallback = sinon.stub();
      staleDataManager.watch('key', staleDataCallback);
      staleDataManager.watch('key2', staleDataCallback);

      staleDataManager.removeStaleData({}, session);

      expect(staleDataCallback.callCount).to.equal(TWO_CALLS);
    });

    it('should trigger callback for removed keys', () => {
      const previousSession = { keyToRemove: 'value' };

      const session = {
        key: 'value',
        keyToRemove: 'value'
      };

      staleDataManager.watch('key', (oldSession, newSession, remove) => {
        remove('keyToRemove');
      });

      const callbackForRemovedKey = sinon.stub();
      staleDataManager.watch('keyToRemove', callbackForRemovedKey);

      staleDataManager.removeStaleData(previousSession, session);

      expect(callbackForRemovedKey.callCount).to.equal(1);
    });

    it('should only trigger callback for removed keys if they exist in session', () => {
      staleDataManager.watch('key1', (previousSession, session, remove) => {
        remove('removedKeyNotInSession');
      });

      const staleDataCallback = sinon.stub();
      staleDataManager.watch('removedKeyNotInSession', staleDataCallback);

      staleDataManager.removeStaleData({}, {});

      expect(staleDataCallback.callCount).to.equal(0);
    });

    it('should trigger only one callback per key', () => {
      const previousSession = { keyToRemove: 'value' };

      const session = {
        key1: 'value',
        keyToRemove: 'value'
      };

      staleDataManager.watch('key1', (oldSession, newSession, remove) => {
        // remove key twice in attempt to trigger callback twice
        remove('keyToRemove');
        remove('keyToRemove');
      });

      const callbackForRemovedKey = sinon.stub();
      staleDataManager.watch('keyToRemove', callbackForRemovedKey);

      staleDataManager.removeStaleData(previousSession, session);

      expect(callbackForRemovedKey.callCount).to.equal(1);
    });

    it('should delete key from session', () => {
      const session = {
        key1: 'value',
        keyToRemove: 'value'
      };

      staleDataManager.watch('key1', (previousSession, newSession, remove) => {
        remove('keyToRemove');
      });

      staleDataManager.removeStaleData({}, session);

      expect(typeof session.keyToRemove).to.equal('undefined');
    });
  });
});
const { expect } = require('test/util/chai');

const modulePath = 'app/services/idam';
const idam = require(modulePath);

let req = {};

describe(modulePath, () => {
  describe('#userId', () => {
    it('returns undefined if no userDetails exists', () => {
      req = {};
      const userId = idam.userId(req);
      expect(userId).to.eql(undefined); // eslint-disable-line no-undefined
    });
    it('returns user id if userDetails exists', () => {
      const uid = 'user.id';
      req.idam = { userDetails: { id: uid } };
      const userId = idam.userId(req);
      expect(userId).to.eql(uid);
    });
  });
});

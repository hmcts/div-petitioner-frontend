const co = require('co');
const { expect } = require('test/util/chai');

const modulePath = 'app/components/AddressLookupStep/addressTypes/manual';
const underTest = require(modulePath);


describe(modulePath, () => {
  describe('#interceptor', () => {
    it('should not modify the ctx', done => {
      co(function* generator() {
        let ctx = { addressType: 'manual' };
        ctx = yield underTest.interceptor(ctx);

        expect(ctx).to.deep.equal({ addressType: 'manual' });
      }).then(done, done);
    });
  });


  describe('#action', () => {
    it('should clean up ctx', done => {
      co(function* generator() {
        let ctx = {
          addressType: 'manual',
          addressManual: 'my\n\nnew\n  address\r\nis here\nsomewhere '
        };
        ctx = yield underTest.action(ctx);

        expect(ctx).to.deep.equal({
          addressType: 'manual',
          addressManual: 'my\n\nnew\n  address\r\nis here\nsomewhere ',
          address: ['my', 'new', 'address', 'is here', 'somewhere']
        });
      }).then(done, done);
    });
  });
});

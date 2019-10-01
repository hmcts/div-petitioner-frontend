const co = require('co');
const { expect } = require('test/util/chai');
const rewire = require('rewire');

const modulePath = 'app/components/AddressLookupStep/addressTypes/postcode';
const underTest = rewire(modulePath);

const mockPostcodeClient = require('../mocks/postcodeInfo');
const addressHelpers = require('../helpers/addressHelpers');

describe(modulePath, () => {
  describe('#action', () => {
    let ctx = {};
    let session = {};
    beforeEach(() => {
      ctx = {
        postcode: 'POST COD',
        address: [ 'line1', 'line2' ]
      };
      session = {};
    });
    it('should remove all addressLine from ctx', () => {
      ctx.addressLine1 = 'addressLine1';
      ctx.addressLine2 = 'addressLine2';
      ctx.addressLine3 = 'addressLine3';

      underTest.action(ctx, session);

      expect(ctx).to.not.haveOwnProperty('addressLine1');
      expect(ctx).to.not.haveOwnProperty('addressLine2');
      expect(ctx).to.not.haveOwnProperty('addressLine3');
    });
    it('should format postcode', () => {
      ctx.postcode = 'POSTC OD';
      underTest.action(ctx, session);

      expect(ctx.postcode).to.eql('POST COD');
    });
    it('should add formattedAddress to ctx', () => {
      const returnedCtx = underTest.action(ctx, session);

      expect(returnedCtx.formattedAddress).to.eql({
        whereabouts: ctx.address,
        postcode: ctx.postcode
      });
    });
    it('should remove duplicate postcode from whereabouts', () => {
      ctx.address.push(ctx.postcode);
      const returnedCtx = underTest.action(ctx, session);
      ctx.address.pop();

      expect(returnedCtx.formattedAddress).to.eql({
        whereabouts: ctx.address,
        postcode: ctx.postcode
      });
    });
  });
  describe('#prepareErrors', () => {
    let ctx = {};
    const errorList = [
      { param: 'postcodeError' },
      { param: 'postcode' },
      { param: 'address' },
      { param: 'selectAddressIndex' }
    ];
    beforeEach(() => {
      ctx = {};
    });
    it('should only return errors with param postcodeError', () => {
      ctx.postcodeError = 'true';
      const errorsReturned = underTest.prepareErrors(ctx, errorList);
      expect(errorsReturned).to.eql([{ param: 'postcodeError' }]);
    });
    it('should only return errors with param postcode', () => {
      const errorsReturned = underTest.prepareErrors(ctx, errorList);
      expect(errorsReturned).to.eql([{ param: 'postcode' }]);
    });
    it('should only return errors with param address', () => {
      ctx.postcode = 'POSTCODE';
      const errorsReturned = underTest.prepareErrors(ctx, errorList);
      expect(errorsReturned).to.eql([{ param: 'address' }]);
    });
    it('should only return errors with param selectAddressIndex', () => {
      ctx.postcode = 'POSTCODE';
      ctx.addresses = [];
      ctx.validPostcode = true;
      ctx.selectAddressIndex = '-1';
      const errorsReturned = underTest.prepareErrors(ctx, errorList);
      expect(errorsReturned).to.eql([{ param: 'selectAddressIndex' }]);
    });
    it('should only return no errors', () => {
      ctx.postcode = 'POSTCODE';
      ctx.address = ['some address'];
      ctx.validPostcode = true;
      ctx.selectAddressIndex = '1';
      const errorsReturned = underTest.prepareErrors(ctx, errorList);
      expect(errorsReturned).to.eql([]);
    });
  });
  describe('#interceptor', () => {
    it('should set the ctx.validPostcode property to equal false if the postcode is invalid', done => {
      co(function* generator() {
        let ctx = { addressType: 'postcode', searchPostcode: true, postcode: 'invalid' };
        ctx = yield underTest.interceptor(ctx, {});
        expect(ctx.validPostcode).to.equal(false);
        expect(ctx).to.not.haveOwnProperty('addresses');
      }).then(done, done);
    });


    it('should not set the ctx.addresses property if the postcode is invalid', done => {
      co(function* generator() {
        let ctx = { addressType: 'postcode', searchPostcode: true, postcode: 'invalid' };
        ctx = yield underTest.interceptor(ctx, {});
        expect(ctx).to.not.haveOwnProperty('addresses');
      }).then(done, done);
    });


    it('should set the ctx.validPostcode property to equal true if the postcode is valid', done => {
      co(function* generator() {
        let ctx = { addressType: 'postcode', searchPostcode: true, postcode: 'sw9 9pe' };
        ctx = yield underTest.interceptor(ctx, {});
        expect(ctx.validPostcode).to.equal(true);
      }).then(done, done);
    });

    it('should set the ctx.addresses property to equal the response of the postcodeInfo lookup if the postcode is valid', done => {
      co(function* generator() {
        const { addresses } = yield mockPostcodeClient.lookupPostcode();
        let ctx = { addressType: 'postcode', searchPostcode: true, postcode: 'sw9 9pe' };
        ctx = yield underTest.interceptor(ctx, {});
        expect(ctx.addresses).to.deep.equal(addresses);
      }).then(done, done);
    });

    it('should remove all addressLine items in context if searching by postcode', done => {
      co(function* generator() {
        let ctx = {
          addressType: 'postcode',
          searchPostcode: true,
          postcode: 'sw9 9pe',
          addressLine0: 'line 1',
          addressLine1: 'line 1',
          addressLine2: 'line 2'
        };
        ctx = yield underTest.interceptor(ctx, {});
        expect(ctx).to.not.haveOwnProperty('addressLine0');
        expect(ctx).to.not.haveOwnProperty('addressLine1');
        expect(ctx).to.not.haveOwnProperty('addressLine2');
      }).then(done, done);
    });

    it('handles error from postcode lookup', done => {
      co(function* generator() {
        let ctx = {
          addressType: 'postcode',
          searchPostcode: true,
          postcode: 'error'
        };
        const session = { postcodeLookup: {} };
        ctx = yield underTest.interceptor(ctx, session);
        expect(ctx.postcodeError).to.eql('true');
        expect(session.postcodeLookup.postcodeError).to.eql('true');
      }).then(done, done);
    });

    it('should not set the ctx.address property if ctx.selectAddressIndex === "-1"', done => {
      co(function* generator() {
        const { addresses } = yield mockPostcodeClient.lookupPostcode();

        let ctx = {
          addressType: 'postcode',
          selectAddressIndex: '-1',
          selectAddress: true,
          addresses
        };
        const session = {};
        ctx = yield underTest.interceptor(ctx, session);
        expect(ctx).to.not.haveOwnProperty('address');
        expect(session.postcodeLookup.selectAddressIndex).to.eql('-1');
      }).then(done, done);
    });

    it('should not set the ctx.address property if DPA property is not set from API', done => {
      co(function* generator() {
        const addresses = [{ nonValid: 'address' }];

        let ctx = {
          addressType: 'postcode',
          selectAddressIndex: '0',
          selectAddress: true,
          addresses
        };
        const session = {};
        ctx = yield underTest.interceptor(ctx, session);
        expect(ctx).to.not.haveOwnProperty('address');
        expect(session.postcodeLookup.selectAddressIndex).to.eql('0');
      }).then(done, done);
    });

    it('should set the ctx.address property based upon the value of ctx.selectAddressIndex', done => {
      co(function* generator() {
        const { addresses } = yield mockPostcodeClient.lookupPostcode();

        let ctx = { addressType: 'postcode', selectAddressIndex: '5', addresses, selectAddress: true };
        ctx = yield underTest.interceptor(ctx, {});
        expect(ctx.address).to.deep.equal(
          addressHelpers.buildConcatenatedAddress(addresses[5]));
      }).then(done, done);
    });

    it('should not set the ctx.address property if address object is invalid', done => {
      co(function* generator() {
        const addresses = [{ nonValid: 'address' }];

        let ctx = { addressType: 'postcode', selectAddressIndex: '5', addresses, selectAddress: true };
        ctx = yield underTest.interceptor(ctx, {});
        expect(ctx.address).to.be.an('undefined');
      }).then(done, done);
    });

    it('should set the ctx.addressBaseUK property based upon the value of ctx.selectAddressIndex', done => {
      co(function* generator() {
        const { addresses } = yield mockPostcodeClient.lookupPostcode();
        const expectedAddressBasedUK5 = {
          addressLine1: 'Divorced Org Unfun Department Box 99',
          addressLine2: 'The Splited Builing Aka Sad House 94 LANDOR ROAD',
          addressLine3: 'Small Local Dependent Place Near the river',
          postCode: 'SW9 9PE',
          postTown: 'LONDON',
          county: '',
          country: 'UK'
        };

        let ctx = { addressType: 'postcode', selectAddressIndex: '7', addresses, selectAddress: true };
        ctx = yield underTest.interceptor(ctx, {});
        expect(ctx.addressBaseUK).to.deep.equal(expectedAddressBasedUK5);
      }).then(done, done);
    });

    it('should update the ctx.address property if the ctx.addressConfirmed === true and the form has been edited', done => {
      co(function* generator() {
        const { addresses } = yield mockPostcodeClient.lookupPostcode();

        let ctx = {
          addressType: 'postcode',
          selectAddressIndex: '5',
          addresses,
          addressConfirmed: 'true',
          addressLine0: 'my',
          addressLine1: 'new',
          addressLine2: 'address',
          addressLine3: 'is here'
        };
        ctx = yield underTest.interceptor(ctx, {});
        expect(ctx.address).to.deep.equal(['my', 'new', 'address', 'is here']);
      }).then(done, done);
    });
  });
});

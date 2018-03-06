const { expect, sinon } = require('test/util/chai');
const co = require('co');
const sinonStubPromise = require('sinon-stub-promise');
const statusCode = require('http-status-codes');

sinonStubPromise(sinon);

const modulePath = 'app/services/postcodeInfo';

const postcodeInfo = require(modulePath);

const superagentStub = {};
const mockAddresses = ['address 1', 'address 2', 'address 3'];
const mockPostcode = 'PSTCDE';
const mockUrl = 'url';
const mockToken = 'token';

describe(modulePath, () => {
  beforeEach(() => {
    superagentStub.timeout = sinon.stub().returnsPromise();
    superagentStub.set = sinon.stub().returns(superagentStub);
    superagentStub.get = sinon.stub().returns(superagentStub);
    superagentStub.proxy = sinon.stub().returns(superagentStub);
    superagentStub.timeout.thenable.proxy = sinon.stub()
      .returns(superagentStub.timeout.thenable);
  });

  it('returns address for given postcode', done => {
    const client = postcodeInfo.client(mockToken, mockUrl, superagentStub);
    let resp = {};

    co(function* generator() {
      superagentStub.timeout.resolves({
        body: mockAddresses,
        status: statusCode.OK
      });
      resp = yield client.lookupPostcode(mockPostcode);
    }).then(() => {
      expect(resp.valid).to.eql(true);
      expect(resp.addresses).to.eql(mockAddresses);
      done();
    });
  });

  context('proxy is set', () => {
    const originalValue = process.env.DIVORCE_HTTP_PROXY;

    before(() => {
      process.env.DIVORCE_HTTP_PROXY = 'http://some-proxy-url:123';
    });

    after(() => {
      process.env.DIVORCE_HTTP_PROXY = originalValue;
    });

    it('returns address for given postcode', done => {
      const client = postcodeInfo.client(mockToken, mockUrl, superagentStub);
      let resp = {};

      co(function* generator() {
        superagentStub.timeout.resolves({
          body: mockAddresses,
          status: statusCode.OK
        });
        resp = yield client.lookupPostcode(mockPostcode);
      }).then(() => {
        expect(superagentStub.timeout.thenable.proxy)
          .to.have.been.calledWith(process.env.DIVORCE_HTTP_PROXY);
        expect(resp.valid).to.eql(true);
        done();
      });
    });
  });

  it('returns error if status is not ok', done => {
    const client = postcodeInfo.client(mockToken, mockUrl, superagentStub);
    let resp = {};

    co(function* generator() {
      superagentStub.timeout.resolves({
        body: mockAddresses,
        status: statusCode.NOT_FOUND
      });
      resp = yield client.lookupPostcode(mockPostcode);
    }).then(() => {
      expect(resp.error).to.eql(true);
      done();
    });
  });

  it('is not valid if no address are found', done => {
    const client = postcodeInfo.client(mockToken, mockUrl, superagentStub);
    let resp = {};

    co(function* generator() {
      superagentStub.timeout.resolves({ status: statusCode.NOT_FOUND });
      resp = yield client.lookupPostcode(mockPostcode);
    }).then(() => {
      expect(resp.valid).to.eql(false);
      done();
    });
  });

  it('returns error if error thrown', done => {
    const client = postcodeInfo.client(mockToken, mockUrl, superagentStub);
    let resp = {};

    co(function* generator() {
      superagentStub.timeout.rejects('Error');
      resp = yield client.lookupPostcode(mockPostcode);
    }).then(() => {
      expect(resp.error).to.eql('Error');
      done();
    });
  });
});

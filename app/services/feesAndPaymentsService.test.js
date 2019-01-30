const { expect } = require('chai').use(require('chai-as-promised'));
const sinon = require('sinon');
const request = require('request-promise-native');

const modulePath = 'app/services/feesAndPaymentsService';
const underTest = require(modulePath);

describe(modulePath, () => {
  beforeEach(() => {
    sinon.stub(request, 'get').resolves();
  });

  afterEach(() => {
    request.get.restore();
  });

  it('should call the fee and payments service with the given feeType', done => {
    underTest.getFee('amend-fee')
      .then(() => {
        expect(request.get.calledOnce).to.eql(true);
      })
      .then(done, done);
  });
});

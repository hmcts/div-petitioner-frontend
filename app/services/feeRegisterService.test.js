const { expect } = require('chai').use(require('chai-as-promised'));
const sinon = require('sinon');
const request = require('request-promise-native');

const modulePath = 'app/services/feeRegisterService';
const underTest = require(modulePath);

describe(modulePath, () => {
  beforeEach(() => {
    sinon.stub(request, 'get').resolves();
  });

  afterEach(() => {
    request.get.restore();
  });

  it('should call the fee register service', done => {
    underTest.get({})
      .then(() => {
        expect(request.get.calledOnce).to.eql(true);
      })
      .then(done, done);
  });
});

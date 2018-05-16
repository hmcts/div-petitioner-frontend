const { expect, sinon } = require('test/util/chai');
const statusCodes = require('http-status-codes');

const modulePath = 'app/steps/bye';
const UnderTest = require(modulePath);

describe(modulePath, () => {
  const req = {};
  const res = {};
  let step = {};
  let next = {};

  beforeEach(() => {
    res.redirect = sinon.spy();
    step = new UnderTest();
    next = sinon.stub();
  });

  it('redirects to index page', () => {
    // Act.
    step.handler(req, res, next);
    // Assert.
    expect(next.calledOnce).to.equal(true);
    expect(res.redirect.calledOnce).to.equal(true);
    expect(res.redirect.calledWith(statusCodes.MOVED_PERMANENTLY, '/index')).to.equal(true);
  });
});

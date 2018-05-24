const { expect, sinon } = require('test/util/chai');
const idam = require('app/services/idam');

const modulePath = 'app/core/steps/DestroySessionStep';
const UnderTest = require(modulePath);

describe(modulePath, () => {
  const session = {};
  const ctx = {};
  let step = {};

  beforeEach(() => {
    session.destroy = sinon.stub().callsArgWith(0, null);
    step = new UnderTest();
  });

  it('destroys session in its interceptor', () => {
    // Act.
    step.interceptor(ctx, session).next();
    // Assert.
    expect(session.destroy.called).to.equal(true);
  });

  it('resolves if session is destroyed without errors', done => {
    // Act.
    const output = step.interceptor(ctx, session).next();
    // Assert.
    expect(output.value)
      .to.be.fulfilled
      .and.notify(done);
  });

  it('returns logout middleware', () => {
    const logoutStub = sinon.stub();
    sinon.stub(idam, 'logout').returns(logoutStub);

    // Act.
    const output = step.middleware;
    // Assert.
    expect(output).to.eql([logoutStub]);

    idam.logout.restore();
  });

  it('rejects if session destroy returns an error', done => {
    // Arrange.
    const destroyError = new Error('some error');
    session.destroy.callsArgWith(0, destroyError);
    // Act.
    const output = step.interceptor(ctx, session).next();
    // Assert.
    expect(output.value)
      .to.be.rejectedWith(destroyError)
      .and.notify(done);
  });
});

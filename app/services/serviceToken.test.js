const { expect, sinon } = require('test/util/chai');
const serviceAuthProviderClient = require('@hmcts/div-service-auth-provider-client');
const CONF = require('config');

const modulePath = 'app/services/serviceToken';
const underTest = require(modulePath);
const mockedClient = require('app/services/mocks/serviceToken');

describe(modulePath, () => {
  describe('module', () => {
    context('microservice key is set', () => {
      const originalKey = CONF.services.serviceAuthProvider.microserviceKey;
      let leaseStub = null;

      beforeEach(() => {
        CONF.services.serviceAuthProvider.microserviceKey = 'some-key';
        leaseStub = sinon.stub().resolves();
        sinon.stub(serviceAuthProviderClient, 'init').returns({ lease: leaseStub });
      });

      afterEach(() => {
        serviceAuthProviderClient.init.restore();
        CONF.services.serviceAuthProvider.microserviceKey = originalKey;
      });

      it('uses the client', done => {
        // Arrange.
        const client = underTest.setup();
        // Assert.
        const assertion = reallyDone => {
          expect(leaseStub.called).to.equal(true);
          reallyDone();
        };
        // Act.
        client.getToken()
          .then(assertion(done))
          .catch(done);
      });
    });

    context('microservice key is not set', () => {
      const originalKey = CONF.services.serviceAuthProvider.microserviceKey;

      beforeEach(() => {
        CONF.services.serviceAuthProvider.microserviceKey = null;
        sinon.spy(mockedClient, 'lease');
      });

      afterEach(() => {
        mockedClient.lease.restore();
        CONF.services.serviceAuthProvider.microserviceKey = originalKey;
      });

      it('falls back to mock if microservice key is not set', done => {
        // Arrange.
        const client = underTest.setup();
        // Act.
        client.getToken()
          .then(() => {
            // Assert.
            expect(mockedClient.lease.called).to.equal(true);
            done();
          })
          .catch(done);
      });
    });
  });

  describe('#getToken', () => {
    const token = 'token';
    let client = null;

    beforeEach(() => {
      sinon.stub(mockedClient, 'isTokenExpired').returns(true);
      sinon.stub(mockedClient, 'lease').resolves(token);
      client = underTest.setup();
    });

    afterEach(() => {
      mockedClient.lease.restore();
      mockedClient.isTokenExpired.restore();
    });

    it('forwards the call to the client', done => {
      // Act.
      client.getToken()
        .then(() => {
          // Assert.
          expect(mockedClient.lease.calledOnce).to.equal(true);
          done();
        })
        .catch(error => {
          return done(error);
        });
    });

    it('resolves sending required data of the response', done => {
      // Act.
      client.getToken()
        .then(output => {
          // Assert.
          expect(output).to.equal(token);
          done();
        })
        .catch(error => {
          return done(error);
        });
    });

    it('does not refresh the token if it has not expired', done => {
      // Arrange.
      mockedClient.isTokenExpired.returns(false);
      // Act.
      client.getToken()
        .then(() => {
          // Assert.
          expect(mockedClient.lease.notCalled).to.equal(true);
          done();
        })
        .catch(error => {
          return done(error);
        });
    });

    it('rejects if something goes wrong', done => {
      // Arrange.
      const error = new Error('Something went wrong');
      mockedClient.lease.rejects(error);
      client = underTest.setup();
      // Act.
      client.getToken()
        .then(() => {
          return done(new Error('Promise not expected to resolve'));
        })
        .catch(output => {
          // Assert.
          expect(output).to.equal(error);
          done();
        });
    });
  });
});

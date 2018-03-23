const { expect, sinon } = require('test/util/chai');
const transformationServiceClient = require('app/services/transformationServiceClient');
const CONF = require('config');

const modulePath = 'app/services/submission';
const underTest = require(modulePath);
const mockedClient = require('app/services/mocks/transformationServiceClient');
const featureTogglesMock = require('test/mocks/featureToggles');
const mockedPaymentClient = require('app/services/mocks/payment');


describe(modulePath, () => {
  const submitSuccess = {
    status: 200,
    statusCode: 200,
    body: {
      caseId: '1234567890',
      error: null,
      status: 'success'
    }
  };
  const updateSuccess = {
    status: 200,
    statusCode: 200,
    body: {
      caseId: '1234567890',
      error: null,
      status: 'success'
    }
  };

  describe('module', () => {
    context('microservice key is set', () => {
      let submitStub = null;

      beforeEach(() => {
        process.env.MICROSERVICE_KEY = 'some-key';
        submitStub = sinon.stub().resolves(submitSuccess);
        sinon.stub(transformationServiceClient, 'init').returns({ submit: submitStub });
      });

      afterEach(() => {
        transformationServiceClient.init.restore();
      });

      it('uses the client', done => {
        // Arrange.
        const client = underTest.setup();
        // Assert.
        const assertion = reallyDone => {
          expect(submitStub.called).to.equal(true);
          reallyDone();
        };
        // Act.
        client.submit()
          .then(assertion(done))
          .catch(done);
      });
    });

    context('microservice key is not set', () => {
      beforeEach(() => {
        delete process.env.MICROSERVICE_KEY;
        sinon.spy(mockedClient, 'submit');
      });

      afterEach(() => {
        mockedClient.submit.restore();
      });

      it('falls back to mock if microservice key is not set', done => {
        // Arrange.
        const client = underTest.setup();
        // Act.
        client.submit()
          .then(() => {
            // Assert.
            expect(mockedClient.submit.called).to.equal(true);
            done();
          })
          .catch(done);
      });
    });
  });

  describe('generatePaymentEventData', () => {
    let session = {}, originalCommonProps = '';

    beforeEach(() => {
      session = {
        courts: 'someCourt',
        court: { someCourt: { siteId: 'XX00' } }
      };
      originalCommonProps = CONF.commonProps;
      CONF.commonProps = { applicationFee: { code: 'some-code', feeVersion: '1' } };
      featureTogglesMock.stub();
    });

    afterEach(() => {
      CONF.commonProps = originalCommonProps;
      featureTogglesMock.restore();
    });
    context('feature is set to false', () => {
      it('returns only payment reference from event data', done => {
        const generatePaymentEventData = (resolved, callback) => { // eslint-disable-line id-blacklist
          mockedPaymentClient.create()
            .then(responsePayment => {
              callback(responsePayment);
              resolved();
            })
            .catch(error => {
              resolved(error);
            });
        };

        const featureMock = featureTogglesMock
          .when('fullPaymentEventDataSubmission', false, generatePaymentEventData, responsePayment => {
            // Assert.
            const output = underTest
              .generatePaymentEventData(session, responsePayment);
            expect(output.payment.PaymentChannel).to.be.an('undefined');
            expect(output.payment.PaymentTransactionId).to.be.an('undefined');
            expect(output.payment).to.have.property('PaymentReference', 'a65-f836-4f61-a628-727199ef6c20');
            expect(output.payment.PaymentDate).to.be.an('undefined');
            expect(output.payment.PaymentAmount).to.be.an('undefined');
            expect(output.payment.PaymentStatus).to.be.an('undefined');
            expect(output.payment.PaymentFeeId).to.be.an('undefined');
            expect(output.payment.PaymentSiteId).to.be.an('undefined');
          });
        featureMock(done);
      });
    });
    context('feature is set to true', () => {
      it('returns the full body of the event data', done => {
        const generatePaymentEventData = (resolved, callback) => { // eslint-disable-line id-blacklist
          mockedPaymentClient.create()
            .then(responsePayment => {
              callback(responsePayment);
              resolved();
            })
            .catch(error => {
              resolved(error);
            });
        };

        const featureMock = featureTogglesMock
          .when('fullPaymentEventDataSubmission', true, generatePaymentEventData, responsePayment => {
            // Assert.
            const ammountFromMock = 55000;
            const output = underTest
              .generatePaymentEventData(session, responsePayment);
            expect(output.payment).to.have.property('PaymentChannel', 'online');
            expect(output.payment).to.have.property('PaymentTransactionId', '123');
            expect(output.payment).to.have.property('PaymentReference', 'a65-f836-4f61-a628-727199ef6c20');
            expect(output.payment).to.have.property('PaymentDate', '20022018');
            expect(output.payment).to.have.property('PaymentAmount', ammountFromMock);
            expect(output.payment).to.have.property('PaymentStatus', 'created');
            expect(output.payment).to.have.property('PaymentFeeId', 'some-code');
            expect(output.payment).to.have.property('PaymentSiteId', 'XX00');
          });
        featureMock(done);
      });
    });
  });

  describe('#submit', () => {
    let client = null;

    beforeEach(() => {
      sinon.stub(mockedClient, 'submit').resolves(submitSuccess);
      client = underTest.setup();
    });

    afterEach(() => {
      mockedClient.submit.restore();
    });

    it('forwards the call to the client', done => {
      // Act.
      client.submit()
        .then(() => {
          // Assert.
          expect(mockedClient.submit.calledOnce).to.equal(true);
          done();
        })
        .catch(error => {
          done(error);
        });
    });

    it('resolves sending required data of the response', done => {
      // Act.
      client.submit()
        .then(output => {
          // Assert.
          expect(output).to.eql(submitSuccess);
          done();
        })
        .catch(error => {
          done(error);
        });
    });

    it('rejects if something goes wrong', done => {
      // Arrange.
      const error = new Error('Something went wrong');
      mockedClient.submit.rejects(error);
      client = underTest.setup();
      // Act.
      client.submit()
        .then(() => {
          done(new Error('Promise not expected to resolve'));
        })
        .catch(output => {
          // Assert.
          expect(output).to.equal(error);
          done();
        });
    });
  });

  describe('#update', () => {
    let client = null;

    beforeEach(() => {
      sinon.stub(mockedClient, 'update').resolves(updateSuccess);
      client = underTest.setup();
    });

    afterEach(() => {
      mockedClient.update.restore();
    });

    it('forwards the call to the client', done => {
      // Act.
      client.update()
        .then(() => {
          // Assert.
          expect(mockedClient.update.calledOnce).to.equal(true);
          done();
        })
        .catch(error => {
          done(error);
        });
    });

    it('resolves sending required data of the response', done => {
      // Act.
      client.update()
        .then(output => {
          // Assert.
          expect(output).to.eql(updateSuccess);
          done();
        })
        .catch(error => {
          done(error);
        });
    });

    it('rejects if something goes wrong', done => {
      // Arrange.
      const error = new Error('Something went wrong');
      mockedClient.update.rejects(error);
      client = underTest.setup();
      // Act.
      client.update()
        .then(() => {
          done(new Error('Promise not expected to resolve'));
        })
        .catch(output => {
          // Assert.
          expect(output).to.equal(error);
          done();
        });
    });
  });
});

const { expect, sinon } = require('test/util/chai');
const transformationServiceClient = require('app/services/transformationServiceClient');
const CONF = require('config');

const modulePath = 'app/services/submission';
const underTest = require(modulePath);
const mockedClient = require('app/services/mocks/transformationServiceClient');

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
    let session = {}, response = {}, originalCommonProps = '';

    beforeEach(() => {
      response = {
        id: '123',
        amount: 1,
        reference: 'some-reference',
        state: { status: 'created', finished: false },
        dateCreated: '1511481600000'
      };
      session = {
        courts: 'someCourt',
        court: { someCourt: { siteId: 'XX00' } }
      };
      originalCommonProps = CONF.commonProps;
      CONF.commonProps = { applicationFee: { code: 'some-code' } };
    });

    afterEach(() => {
      CONF.commonProps = originalCommonProps;
    });

    it('collects update event data for the payload', () => {
      const output = underTest.generatePaymentEventData(session,
        response, true);
      expect(output.payment).to.have.property('PaymentChannel', 'card');
      expect(output.payment).to.have.property('PaymentTransactionId', '123');
      expect(output.payment).to.have.property('PaymentReference', 'some-reference');
      expect(output.payment).to.have.property('PaymentDate', '24112017');
      expect(output.payment).to.have.property('PaymentAmount', 1);
      expect(output.payment).to.have.property('PaymentStatus', 'created');
      expect(output.payment).to.have.property('PaymentFeeId', 'some-code');
      expect(output.payment).to.have.property('PaymentSiteId', 'XX00');
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

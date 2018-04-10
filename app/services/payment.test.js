const { expect, sinon } = require('test/util/chai');
const payClient = require('@hmcts/div-pay-client');

const modulePath = 'app/services/payment';
const underTest = require(modulePath);
const mockedClient = require('app/services/mocks/payment');

describe(modulePath, () => {
  const createSuccess = {
    id: '1',
    amount: 123,
    status: 'created',
    reference: 'some-reference',
    date_created: 1511481600000,
    _links: { next_url: { href: 'https://next-url' } }
  };
  const querySuccess = {
    id: '1',
    amount: 55000,
    status: 'Success',
    reference: 'some-reference',
    external_reference: 'a65-f836-4f61-a628-727199ef6c20',
    date_created: 1505459675824,
    _links: {}
  };

  describe('module', () => {
    context('microservice key is set', () => {
      let createStub = null;

      beforeEach(() => {
        process.env.MICROSERVICE_KEY = 'some-key';
        createStub = sinon.stub().resolves(createSuccess);
        sinon.stub(payClient, 'init').returns({ create: createStub });
      });

      afterEach(() => {
        payClient.init.restore();
      });

      it('uses the client', done => {
        // Arrange.
        const client = underTest.setup();
        // Assert.
        const assertion = reallyDone => {
          expect(createStub.called).to.equal(true);
          reallyDone();
        };
        // Act.
        client.create()
          .then(assertion(done))
          .catch(done);
      });
    });

    context('microservice key is not set', () => {
      beforeEach(() => {
        delete process.env.MICROSERVICE_KEY;
        sinon.spy(mockedClient, 'create');
        sinon.spy(mockedClient, 'query');
      });

      afterEach(() => {
        mockedClient.query.restore();
        mockedClient.create.restore();
      });

      it('falls back to mock if microservice key is not set', done => {
        // Arrange.
        const client = underTest.setup();
        // Act.
        client.create()
          .then(() => {
            // Assert.
            expect(mockedClient.create.called).to.equal(true);
            done();
          })
          .catch(done);
      });
    });
  });

  describe('#isPaymentSuccessful', () => {
    it('returns true when response is success', () => {
      // Arrange.
      const input = { status: 'Success' };
      // Act.
      const output = underTest.isPaymentSuccessful(input);
      // Assert.
      expect(output).to.equal(true);
    });

    it('returns false when response is not success according to contract', () => {
      // Arrange.
      const input = { some: { value: true, bar: 'foo-bar-baz' } };
      // Act.
      const output = underTest.isPaymentSuccessful(input);
      // Assert.
      expect(output).to.equal(false);
    });
  });

  describe('#create', () => {
    let client = null;

    beforeEach(() => {
      sinon.stub(mockedClient, 'create').resolves(createSuccess);
      client = underTest.setup();
    });

    afterEach(() => {
      mockedClient.create.restore();
    });

    it('forwards the call to the client', done => {
      // Act.
      client.create()
        .then(() => {
          // Assert.
          expect(mockedClient.create.calledOnce).to.equal(true);
          done();
        })
        .catch(error => {
          done(error);
        });
    });

    it('resolves sending required data of the response', done => {
      // Arrange.
      const
        { id, status, amount, reference, date_created } = createSuccess; // eslint-disable-line camelcase
      const expectedResponse = {
        id,
        amount,
        status,
        reference,
        date_created,
        nextUrl: createSuccess._links.next_url.href
      };
      // Act.
      client.create()
        .then(output => {
          // Assert.
          expect(output).to.eql(expectedResponse);
          done();
        })
        .catch(error => {
          done(error);
        });
    });

    it('rejects if something goes wrong', done => {
      // Arrange.
      const error = new Error('Something went wrong');
      mockedClient.create.rejects(error);
      client = underTest.setup();
      // Act.
      client.create()
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

  describe('#query', () => {
    let client = null;

    beforeEach(() => {
      sinon.stub(mockedClient, 'query').resolves(querySuccess);
      client = underTest.setup();
    });

    afterEach(() => {
      mockedClient.query.restore();
    });

    it('forwards the call to the client', done => {
      // Act.
      client.query()
        .then(() => {
          // Assert.
          expect(mockedClient.query.calledOnce).to.equal(true);
          done();
        })
        .catch(error => {
          done(error);
        });
    });

    it('resolves sending required data of the response', done => {
      // Arrange.
      const
        {
          id, amount, status, reference,
          external_reference, date_created
        } = querySuccess; // eslint-disable-line camelcase
      const expectedResponse = {
        id,
        amount,
        reference,
        external_reference,
        status,
        date_created
      };
      // Act.
      client.query()
        .then(output => {
          // Assert.
          expect(output).to.eql(expectedResponse);
          done();
        })
        .catch(error => {
          done(error);
        });
    });

    it('rejects if something goes wrong', done => {
      // Arrange.
      const error = new Error('Something went wrong');
      mockedClient.query.rejects(error);
      client = underTest.setup();
      // Act.
      client.query()
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

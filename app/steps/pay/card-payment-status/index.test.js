/* eslint-disable max-nested-callbacks */

const request = require('supertest');
const statusCodes = require('http-status-codes');
const { withSession } = require('test/util/setup');
const idamMock = require('test/mocks/idam');

const { expect, sinon } = require('test/util/chai');
const server = require('app');
const featureTogglesMock = require('test/mocks/featureToggles');
const { testRedirect, testCustom } = require('test/util/assertions');
const jwt = require('jsonwebtoken');
const serviceToken = require('app/services/serviceToken');
const payment = require('app/services/payment');
const submission = require('app/services/submission');

const modulePath = 'app/steps/pay/card-payment-status';

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  let getToken = null;
  let query = null;
  let update = null;

  beforeEach(() => {
    getToken = sinon.stub().resolves('token');
    query = sinon.stub().resolves({ status: 'success' });
    update = sinon.stub().resolves({ caseId: '1509031793780148', error: null, status: 'success' });
    sinon.stub(serviceToken, 'setup').returns({ getToken });
    sinon.stub(payment, 'setup').returns({ query });
    sinon.stub(submission, 'setup').returns({ update });
    sinon.stub(jwt, 'decode').returns({ id: 1 });

    idamMock.stub();
    featureTogglesMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.CardPaymentStatus;
  });

  afterEach(() => {
    payment.setup.restore();
    submission.setup.restore();
    jwt.decode.restore();
    serviceToken.setup.restore();

    s.http.close();
    featureTogglesMock.restore();
    idamMock.restore();
  });

  describe('handler', () => {
    let session = {};

    beforeEach(done => {
      session = { currentPaymentReference: 90, currentPaymentId: 99 };
      withSession(done, agent, session);
    });

    it('gets a service token before calling the payment service', done => {
      testCustom(done, agent, underTest, [], () => {
        // Assert.
        expect(getToken.calledBefore(query)).to.equal(true);
      });
    });

    it('takes payment id from session', done => {
      testCustom(done, agent, underTest, [], () => {
        // Assert.
        expect(query.args[0][2]).to.equal(session.currentPaymentReference);
      });
    });

    it('returns early with payment status if already found in session', done => {
      const test = () => {
        testCustom(done, agent, underTest, [], () => {
          // Assert.
          expect(getToken.notCalled).to.equal(true);
          expect(query.notCalled).to.equal(true);
        });
      };
      // Arrange.
      withSession(test, agent, {
        currentPaymentId: 99,
        payments: { 99: { status: 'failed' } }
      });
    });

    it('redirects to error page when payment state cannot be determined', done => {
      // Arrange.
      query.rejects();

      testCustom(done, agent, underTest, [], response => {
        // Assert.
        expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
        expect(response.headers.location).to.equal('/generic-error');
      });
    });

    it('redirects to error page when transformation service returns an error', done => {
      // Arrange.
      update.resolves({ caseId: 0, error: 'some error info', status: 'error' });

      testCustom(done, agent, underTest, [], response => {
        // Assert.
        expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
        expect(response.headers.location).to.equal('/generic-error');
      });
    });

    context('Idam is turned ON', () => {
      it('uses the token of the logged in user', done => {
        // Arrange.
        const userCookie = ['__auth-token=auth.token'];
        // Act.
        const featureMock = featureTogglesMock
          .when('idam', true, testCustom, agent, underTest, userCookie, () => {
            // Assert.
            expect(query.calledOnce).to.equal(true);
            expect(query.args[0][0]).to.eql({ id: 1, bearerToken: 'auth.token' });
          });
        featureMock(done);
      });
    });

    context('Idam is turned OFF', () => {
      it('uses a fake user for the mocks', done => {
        // Act.
        const featureMock = featureTogglesMock
          .when('idam', false, testCustom, agent, underTest, [], () => {
            // Assert.
            expect(query.calledOnce).to.equal(true);
            expect(query.args[0][0]).to.eql({});
          });
        featureMock(done);
      });
    });

    context('payment was successful', () => {
      it('redirects to Done page', done => {
        // Arrange.
        query.resolves({ status: 'success' });
        // Act & Assert.
        testRedirect(done, agent, underTest, {}, s.steps.DoneAndSubmitted);
      });

      it('updates CCD with payment status', done => {
        // Arrange.
        query.resolves({ status: 'success' });
        // Act.
        testCustom(done, agent, underTest, [], () => {
          // Assert.
          expect(update.calledOnce).to.equal(true);
        });
      });

      context('submission update was not successful', () => {
        it('redirects to the generic error page', done => {
          // Arrange.
          update.resolves({
            caseId: 0,
            error: 'some error with a wrapped java exception',
            status: 'error'
          });
          // Act.
          testCustom(done, agent, underTest, [], response => {
            // Assert.
            expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
            expect(response.header.location).to.equal('/generic-error');
          });
        });
      });
    });

    context('payment was not successful', () => {
      beforeEach(() => {
        query.resolves({ status: 'failed' });
      });

      it('does not update CCD with payment status', done => {
        testCustom(done, agent, underTest, [], () => {
          // Assert.
          expect(update.notCalled).to.equal(true);
        });
      });

      it('redirects to Pay how page', done => {
        // Act & Assert.
        testRedirect(done, agent, underTest, {}, s.steps.PayOnline);
      });
    });
  });
});

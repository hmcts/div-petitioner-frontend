/* eslint-disable max-nested-callbacks */

const request = require('supertest');
const statusCodes = require('http-status-codes');
const { withSession } = require('test/util/setup');
const idamMock = require('test/mocks/idam');

const { expect, sinon } = require('test/util/chai');
const server = require('app');
const featureTogglesMock = require('test/mocks/featureToggles');
const { testHttpStatus, testRedirect, testCustom } = require('test/util/assertions');
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
    query = sinon.stub().resolves({ state: { status: 'success', finished: true } });
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
    context('Online submission is turned OFF', () => {
      it('returns not found', done => {
        // Act & Assert.
        const featureMock = featureTogglesMock
          .when('onlineSubmission', false, testHttpStatus, agent, underTest, statusCodes.NOT_FOUND);
        featureMock(done);
      });
    });

    context('Online submission is turned ON', () => {
      let session = {};

      beforeEach(done => {
        session = { currentPaymentId: 99 };
        withSession(done, agent, session);
      });

      it('gets a service token before calling the payment service', done => {
        // Act.
        const featureMock = featureTogglesMock
          .when('onlineSubmission', true, testCustom, agent, underTest, [], () => {
            // Assert.
            expect(getToken.calledBefore(query)).to.equal(true);
          });
        featureMock(done);
      });

      it('takes payment id from session', done => {
        // Act.
        const featureMock = featureTogglesMock
          .when('onlineSubmission', true, testCustom, agent, underTest, [], () => {
            // Assert.
            expect(query.args[0][2]).to.equal(session.currentPaymentId);
          });
        featureMock(done);
      });

      it('returns early with payment status if already found in session', done => {
        // Act.
        const featureMock = featureTogglesMock
          .when('onlineSubmission', true, testCustom, agent, underTest, [], () => {
            // Assert.
            expect(getToken.notCalled).to.equal(true);
            expect(query.notCalled).to.equal(true);
          });
        const test = () => {
          featureMock(done);
        };
        // Arrange.
        withSession(test, agent, {
          currentPaymentId: 99,
          payments: { 99: { state: { status: 'failed', finished: true } } }
        });
      });

      it('redirects to error page when payment state cannot be determined', done => {
        // Arrange.
        query.rejects();
        // Act.
        const featureMock = featureTogglesMock
          .when('onlineSubmission', true, testCustom, agent, underTest, [], response => {
            // Assert.
            expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
            expect(response.headers.location).to.equal('/generic-error');
          });
        featureMock(done);
      });

      it('redirects to error page when transformation service returns an error', done => {
        // Arrange.
        update.resolves({ caseId: 0, error: 'some error info', status: 'error' });
        // Act.
        const featureMock = featureTogglesMock
          .when('onlineSubmission', true, testCustom, agent, underTest, [], response => {
            // Assert.
            expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
            expect(response.headers.location).to.equal('/generic-error');
          });
        featureMock(done);
      });

      context('Idam is turned ON', () => {
        it('uses the token of the logged in user', done => {
          // Arrange.
          const userCookie = ['__auth-token=auth.token'];
          // Act.
          const featureMock = featureTogglesMock
            .when(['idam', 'onlineSubmission'], [true, true], testCustom, agent, underTest, userCookie, () => {
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
            .when(['idam', 'onlineSubmission'], [false, true], testCustom, agent, underTest, [], () => {
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
          query.resolves({ state: { status: 'success', finished: true } });
          // Act & Assert.
          const featureMock = featureTogglesMock
            .when('onlineSubmission', true, testRedirect, agent, underTest, {}, s.steps.DoneAndSubmitted);
          featureMock(done);
        });

        it('updates CCD with payment status', done => {
          // Arrange.
          query.resolves({ state: { status: 'success', finished: true } });
          // Act.
          const featureMock = featureTogglesMock
            .when('onlineSubmission', true, testCustom, agent, underTest, [], () => {
              // Assert.
              expect(update.calledOnce).to.equal(true);
            });
          featureMock(done);
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
            const featureMock = featureTogglesMock
              .when('onlineSubmission', true, testCustom, agent, underTest, [], response => {
                // Assert.
                expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
                expect(response.header.location).to.equal('/generic-error');
              });
            featureMock(done);
          });
        });
      });

      context('payment was not successful', () => {
        beforeEach(() => {
          query.resolves({ state: { status: 'failed', finished: true } });
        });

        it('does not update CCD with payment status', done => {
          // Act.
          const featureMock = featureTogglesMock
            .when('onlineSubmission', true, testCustom, agent, underTest, [], () => {
              // Assert.
              expect(update.notCalled).to.equal(true);
            });
          featureMock(done);
        });

        it('redirects to Pay how page', done => {
          // Act & Assert.
          const featureMock = featureTogglesMock
            .when('onlineSubmission', true, testRedirect, agent, underTest, {}, s.steps.PayOnline);
          featureMock(done);
        });
      });
    });
  });
});

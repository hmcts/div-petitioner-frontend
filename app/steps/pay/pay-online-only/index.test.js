/* eslint-disable max-nested-callbacks */
const request = require('supertest');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { testContent, testCustom, getSession } = require('test/util/assertions');
const featureToggleConfig = require('test/util/featureToggles');
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');
const getBaseUrl = require('app/core/utils/baseUrl');
const { expect, sinon } = require('test/util/chai');
const statusCodes = require('http-status-codes');
const { withSession } = require('test/util/setup');
const serviceToken = require('app/services/serviceToken');
const payment = require('app/services/payment');
const submission = require('app/services/submission');
const CONF = require('config');
const idam = require('app/services/idam');
const serviceCentreCourt = require('test/examples/courts/serviceCentre');

const modulePath = 'app/steps/pay/pay-online-only';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};
const two = 2;
let cookies = [];

const userDetails = {
  id: 1,
  email: 'simulate-delivered@notifications.service.gov.uk'
};
const idamUserDetailsMiddlewareMock = (req, res, next) => {
  req.idam = { userDetails };
  next();
};

describe(modulePath, () => {
  const allocatedCourt = serviceCentreCourt;

  beforeEach(() => {
    sinon.stub(applicationFeeMiddleware, 'updateApplicationFeeMiddleware')
      .callsArgWith(two);
    sinon.spy(getBaseUrl);
    sinon.stub(idam, 'userDetails').returns(idamUserDetailsMiddlewareMock);
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.PayOnline;
  });

  afterEach(() => {
    idamMock.restore();
    applicationFeeMiddleware.updateApplicationFeeMiddleware.restore();
    idam.userDetails.restore();
  });

  describe('#middleware', () => {
    it('returns updateApplicationFeeMiddleware in middleware', () => {
      expect(underTest.middleware
        .includes(applicationFeeMiddleware.updateApplicationFeeMiddleware))
        .to.eql(true);
    });
  });


  describe('New Application', () => {
    it('renders the content from the content file', done => {
      const dataContent = { feeToBePaid: '550' };
      testContent(done, agent, underTest, content, dataContent);
    });
  });

  describe('Amended Case', () => {
    let session = {};

    beforeEach(done => {
      session = { previousCaseId: 'old-case-id' };

      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const dataContent = { feeToBePaid: '95' };
      testContent(done, agent, underTest, content, dataContent);
    });
  });

  describe('#handler', () => {
    let getToken = null;
    let create = null;
    let queryAllPayments = null;
    let update = null;

    beforeEach(() => {
      cookies = [
        '__auth-token=auth.token',
        'connect.sid=some-sid'
      ];
      getToken = sinon.stub().resolves('token');
      // Payment create stub
      create = sinon.stub().resolves({
        id: '42',
        reference: 'some-payment-reference',
        status: 'created',
        nextUrl: 'https://pay.the.gov/here'
      });
      // Payment query all payments stub
      queryAllPayments = sinon.stub().resolves({
        payments: [
          {
            id: '42',
            reference: 'some-payment-reference',
            status: 'failed',
            nextUrl: 'https://pay.the.gov/here'
          }
        ]
      });
      // Submission update stub
      update = sinon.stub().resolves({
        caseId: '1509031793780148',
        error: null,
        status: 'success'
      });
      sinon.stub(serviceToken, 'setup').returns({ getToken });
      sinon.stub(payment, 'setup').returns({ create, queryAllPayments });
      sinon.stub(submission, 'setup').returns({ update });
    });

    afterEach(() => {
      submission.setup.restore();
      payment.setup.restore();
      serviceToken.setup.restore();
    });

    context('Case Id is missing', () => {
      let session = {};

      beforeEach(done => {
        session = { allocatedCourt: serviceCentreCourt };

        withSession(done, agent, session);
      });
      it('redirects to the generic error page', done => {
        // Act.
        testCustom(done, agent, underTest, cookies, response => {
          // Assert.
          expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
          expect(response.header.location).to.equal('/generic-error');
          expect(serviceToken.setup.called).to.eql(false);
        }, 'post');
      });
    });

    context('Success - Amend Petition', () => {
      let session = {};

      const code = CONF.commonProps.amendFee.feeCode;
      const version = CONF.commonProps.amendFee.version;
      const amount = parseInt(
        CONF.commonProps.amendFee.amount
      );

      beforeEach(done => {
        session = {
          caseId: 'some-case-id',
          allocatedCourt: serviceCentreCourt,
          previousCaseId: 'old-case-id'
        };

        withSession(done, agent, session);
      });

      it('gets a service token before calling the payment service', done => {
        // Act.
        testCustom(done, agent, underTest, cookies, () => {
          // Assert.
          expect(getToken.calledBefore(create)).to.equal(true);
        }, 'post');
      });

      it('sets the returnUrl and serviceCallbackUrl dynamically when feature flag is true', done => {
        const featureTest = featureToggleConfig
          .when('strategicPay', true, testCustom, agent, underTest, cookies, response => {
            // Assert.
            const returnUrl = response.request.protocol.concat(
              '//', response.request.host, '/pay/card-payment-status'
            );
            const serviceCallbackUrl = CONF.services.transformation.baseUrl.concat('/payment-update');
            expect(create.calledWith(
              sinon.match.any, {}, 'token', 'some-case-id', allocatedCourt.siteId, code, version, amount,
              'Filing an application for a divorce, nullity or civil partnership dissolution – fees order 1.2.',
              returnUrl, serviceCallbackUrl
            )).to.equal(true);
          }, 'post');

        // Act.
        featureTest(done);
      });

      it('sets the returnUrl dynamically when feature flag is false', done => {
        const featureTest = featureToggleConfig
          .when('strategicPay', false, testCustom, agent, underTest, cookies, response => {
            // Assert.
            const returnUrl = response.request.protocol.concat(
              '//', response.request.host, '/pay/card-payment-status'
            );
            const serviceCallbackUrl = '';
            expect(create.calledWith(
              sinon.match.any, {}, 'token', 'some-case-id', allocatedCourt.siteId, code, version, amount,
              'Filing an application for a divorce, nullity or civil partnership dissolution – fees order 1.2.',
              returnUrl, serviceCallbackUrl
            )).to.equal(true);
          }, 'post');

        // Act.
        featureTest(done);
      });
    });


    context('Success - New Application', () => {
      let session = {};

      const code = CONF.commonProps.applicationFee.feeCode;
      const version = CONF.commonProps.applicationFee.version;
      const amount = parseInt(
        CONF.commonProps.applicationFee.amount
      );

      beforeEach(done => {
        session = {
          caseId: 'some-case-id',
          allocatedCourt: serviceCentreCourt
        };

        withSession(done, agent, session);
      });

      it('gets a service token before calling the payment service', done => {
        // Act.
        testCustom(done, agent, underTest, cookies, () => {
          // Assert.
          expect(getToken.calledBefore(create)).to.equal(true);
        }, 'post');
      });

      it('sets the returnUrl and serviceCallbackUrl dynamically when feature flag is true', done => {
        const featureTest = featureToggleConfig
          .when('strategicPay', true, testCustom, agent, underTest, cookies, response => {
            // Assert.
            const returnUrl = response.request.protocol.concat(
              '//', response.request.host, '/pay/card-payment-status'
            );
            const serviceCallbackUrl = CONF.services.transformation.baseUrl.concat('/payment-update');
            expect(create.calledWith(
              sinon.match.any, {}, 'token', 'some-case-id', allocatedCourt.siteId, code, version, amount,
              'Filing an application for a divorce, nullity or civil partnership dissolution – fees order 1.2.',
              returnUrl, serviceCallbackUrl
            )).to.equal(true);
          }, 'post');

        // Act.
        featureTest(done);
      });

      it('sets the returnUrl dynamically when feature flag is false', done => {
        const featureTest = featureToggleConfig
          .when('strategicPay', false, testCustom, agent, underTest, cookies, response => {
            // Assert.
            const returnUrl = response.request.protocol.concat(
              '//', response.request.host, '/pay/card-payment-status'
            );
            const serviceCallbackUrl = '';
            expect(create.calledWith(
              sinon.match.any, {}, 'token', 'some-case-id', allocatedCourt.siteId, code, version, amount,
              'Filing an application for a divorce, nullity or civil partnership dissolution – fees order 1.2.',
              returnUrl, serviceCallbackUrl
            )).to.equal(true);
          }, 'post');

        // Act.
        featureTest(done);
      });

      context('Court is selected', () => {
        it('creates payment with the site ID of the court', done => {
          // Act.
          testCustom(done, agent, underTest, [], () => {
            // Assert.
            expect(code).to.not.eql(null);
            expect(version).to.not.eql(null);
            expect(amount).to.not.eql(null);
            expect(create.calledWith(sinon.match.any, {}, 'token', session.caseId, allocatedCourt.siteId, code, version, amount)).to.equal(true);
          }, 'post');
        });
      });

      context('Idam is turned ON', () => {
        it('uses the token of the logged in user', done => {
          // Act.
          const featureTest = featureToggleConfig
            .when('idam', true, testCustom, agent, underTest, cookies, () => {
              // Assert.
              expect(create.calledOnce).to.equal(true);
              expect(create.args[0][1]).to.eql({ id: 1, bearerToken: 'auth.token' });
            }, 'post');
          featureTest(done);
        });
      });

      context('Idam is turned OFF', () => {
        it('uses a fake user for the mocks', done => {
          // Act.
          const featureTest = featureToggleConfig
            .when('idam', false, testCustom, agent, underTest, [], () => {
              // Assert.
              expect(create.calledOnce).to.equal(true);
              expect(create.args[0][1]).to.eql({});
            }, 'post');
          featureTest(done);
        });
      });

      context('check payment history', () => {
        it('case containing a success payment is redirected to card payment status', done => {
          payment.setup.restore();
          queryAllPayments = sinon.stub().resolves({
            payments: [
              {
                payment_reference: 'some-payment-reference-1',
                status: 'Initiated'
              },
              {
                payment_reference: 'some-payment-reference-2',
                status: 'Success'
              }
            ]
          });
          sinon.stub(payment, 'setup').returns({ create, queryAllPayments });
          // Act.
          testCustom(done, agent, underTest, cookies, response => {
            // Assert.
            expect(create.notCalled).to.equal(true);
            expect(update.notCalled).to.equal(true);
            expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
            expect(response.header.location).to.equal('/pay/card-payment-status');
          }, 'post');
        });
        it('case containing an initiated payment is redirect to an awaiting payment status page', done => {
          payment.setup.restore();

          queryAllPayments = sinon.stub().resolves({
            payments: [
              {
                payment_reference: 'some-payment-reference-1',
                status: 'Failed'
              },
              {
                payment_reference: 'some-payment-reference-2',
                status: 'Initiated'
              }
            ]
          });
          sinon.stub(payment, 'setup').returns({ create, queryAllPayments });

          // Act.
          testCustom(done, agent, underTest, cookies, response => {
            // Assert.
            expect(create.notCalled).to.equal(true);
            expect(update.notCalled).to.equal(true);
            expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
            expect(response.header.location).to.equal('/pay/awaiting-payment-status');
          }, 'post');
        });

        it('case not containing an initiated/success payment directed to gov.uk payment page', done => {
          payment.setup.restore();
          queryAllPayments = sinon.stub().resolves({
            payments: [
              {
                id: '42',
                payment_reference: 'some-payment-reference',
                status: 'Failed'
              }
            ]
          });
          sinon.stub(payment, 'setup').returns({ create, queryAllPayments });
          const testSession = () => {
            getSession(agent).then(currentSession => {
              expect(currentSession.paymentMethod).to.equal('card-online');
              done();
            });
          };
          // Act.
          testCustom(testSession, agent, underTest, cookies, response => {
            // Assert.
            expect(create.calledOnce).to.equal(true);
            expect(update.calledOnce).to.equal(true);
            expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
            expect(response.header.location).to.equal('https://pay.the.gov/here');
          }, 'post');
        });
      });

      context('payment creation was successful', () => {
        it('updates CCD with payment data', done => {
          // Act.
          testCustom(done, agent, underTest, cookies, () => {
            // Assert.
            expect(update.calledOnce).to.equal(true);
          }, 'post');
        });

        it('redirects to the gov.uk payment page', done => {
          const testSession = () => {
            getSession(agent).then(currentSession => {
              expect(currentSession.paymentMethod).to.equal('card-online');
              done();
            });
          };
          // Act.
          testCustom(testSession, agent, underTest, cookies, response => {
            // Assert.
            expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
            expect(response.header.location).to.equal('https://pay.the.gov/here');
          }, 'post');
        });
      });

      context('payment creation was not successful', () => {
        it('redirects to Pay how page', done => {
          // Arrange.
          create.rejects();
          // Act.
          testCustom(done, agent, underTest, cookies, response => {
            // Assert.
            expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
            expect(response.header.location).to.equal('/generic-error');
          }, 'post');
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
          testCustom(done, agent, underTest, cookies, response => {
            // Assert.
            expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
            expect(response.header.location).to.equal('/generic-error');
          }, 'post');
        });
      });
    });
  });
});

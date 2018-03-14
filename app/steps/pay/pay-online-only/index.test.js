/* eslint-disable max-nested-callbacks */
const request = require('supertest');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { testContent, testHttpStatus, testCustom } = require('test/util/assertions');
const featureTogglesMock = require('test/mocks/featureToggles');
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');
const { expect, sinon } = require('test/util/chai');
const statusCodes = require('http-status-codes');
const { withSession } = require('test/util/setup');
const jwt = require('jsonwebtoken');
const serviceToken = require('app/services/serviceToken');
const payment = require('app/services/payment');
const submission = require('app/services/submission');
const CONF = require('config');

const modulePath = 'app/steps/pay/pay-online-only';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};
const two = 2;
let cookies = [];
const PENCE_PER_POUND = 100;
const code = CONF.commonProps.applicationFee.code;
const amount = parseInt(
  CONF.commonProps.applicationFee.fee_amount
) * PENCE_PER_POUND;

describe(modulePath, () => {
  beforeEach(() => {
    sinon.stub(applicationFeeMiddleware, 'updateApplicationFeeMiddleware')
      .callsArgWith(two);
    featureTogglesMock.stub();
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.PayOnline;
  });

  afterEach(() => {
    s.http.close();
    idamMock.restore();
    featureTogglesMock.restore();
    applicationFeeMiddleware.updateApplicationFeeMiddleware.restore();
  });

  describe('#middleware', () => {
    it('returns updateApplicationFeeMiddleware in middleware', () => {
      expect(underTest.middleware
        .includes(applicationFeeMiddleware.updateApplicationFeeMiddleware))
        .to.eql(true);
    });
  });

  describe('success', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });
  });

  describe('#handler', () => {
    let getToken = null;
    let create = null;
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
        state: { status: 'created', finished: false },
        nextUrl: 'https://pay.the.gov/here'
      });
      // Submission update stub
      update = sinon.stub().resolves({
        caseId: '1509031793780148',
        error: null,
        status: 'success'
      });
      sinon.stub(serviceToken, 'setup').returns({ getToken });
      sinon.stub(payment, 'setup').returns({ create });
      sinon.stub(submission, 'setup').returns({ update });
      sinon.stub(jwt, 'decode').returns({ id: 1 });
    });

    afterEach(() => {
      jwt.decode.restore();
      submission.setup.restore();
      payment.setup.restore();
      serviceToken.setup.restore();
    });

    context('Online submission is turned OFF', () => {
      it('returns not found', done => {
        // Act & Assert.
        const featureMock = featureTogglesMock
          .when('onlineSubmission', false, testHttpStatus, agent, underTest, statusCodes.NOT_FOUND, 'post');
        featureMock(done);
      });
    });

    context('Online submission is turned ON', () => {
      it('returns bad request on incorrect request format', done => {
        // Act.
        const featureMock = featureTogglesMock
          .when('onlineSubmission', true, testCustom, agent, underTest, ['empty'], response => {
            // Assert.
            expect(response.status).to.equal(statusCodes.BAD_REQUEST);
          }, 'post');
        featureMock(done);
      });

      it('gets a service token before calling the payment service', done => {
        // Act.
        const featureMock = featureTogglesMock
          .when('onlineSubmission', true, testCustom, agent, underTest, [], () => {
            // Assert.
            expect(getToken.calledBefore(create)).to.equal(true);
          }, 'post');
        featureMock(done);
      });

      context('Court is selected', () => {
        let session = {}, siteId = '';

        beforeEach(done => {
          siteId = 'some-code';
          session = {
            caseId: 'some-case-id',
            court: {
              someCourt: { siteId },
              someOtherCourt: { siteId: 'some-other-code' }
            },
            courts: 'someCourt'
          };

          withSession(done, agent, session);
        });

        it('creates payment with the site ID of the court', done => {
          // Act.
          const featureMock = featureTogglesMock
            .when('onlineSubmission', true, testCustom, agent, underTest, [], () => {
              // Assert.
              expect(code).to.not.eql(null);
              expect(amount).to.not.eql(null);
              expect(create.calledWith({}, 'token', session.caseId, siteId, code, amount)).to.equal(true);
            }, 'post');
          featureMock(done);
        });
      });

      context('Idam is turned ON', () => {
        it('uses the token of the logged in user', done => {
          // Act.
          const featureMock = featureTogglesMock
            .when(['idam', 'onlineSubmission'], [true, true], testCustom, agent, underTest, cookies, () => {
              // Assert.
              expect(create.calledOnce).to.equal(true);
              expect(create.args[0][0]).to.eql({ id: 1, bearerToken: 'auth.token' });
            }, 'post');
          featureMock(done);
        });
      });

      context('Idam is turned OFF', () => {
        it('uses a fake user for the mocks', done => {
          // Act.
          const featureMock = featureTogglesMock
            .when(['idam', 'onlineSubmission'], [false, true], testCustom, agent, underTest, [], () => {
              // Assert.
              expect(create.calledOnce).to.equal(true);
              expect(create.args[0][0]).to.eql({});
            }, 'post');
          featureMock(done);
        });
      });

      context('payment creation was successful', () => {
        it('updates CCD with payment data', done => {
          // Act.
          const featureMock = featureTogglesMock
            .when('onlineSubmission', true, testCustom, agent, underTest, cookies, () => {
              // Assert.
              expect(update.calledOnce).to.equal(true);
            }, 'post');
          featureMock(done);
        });

        it('redirects to the gov.uk payment page', done => {
          // Act.
          const featureMock = featureTogglesMock
            .when('onlineSubmission', true, testCustom, agent, underTest, cookies, response => {
              // Assert.
              expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
              expect(response.header.location).to.equal('https://pay.the.gov/here');
            }, 'post');
          featureMock(done);
        });
      });

      context('payment creation was not successful', () => {
        it('redirects to Pay how page', done => {
          // Arrange.
          create.rejects();
          // Act.
          const featureMock = featureTogglesMock
            .when('onlineSubmission', true, testCustom, agent, underTest, cookies, response => {
              // Assert.
              expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
              expect(response.header.location).to.equal('/generic-error');
            }, 'post');
          featureMock(done);
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
          const featureMock = featureTogglesMock
            .when('onlineSubmission', true, testCustom, agent, underTest, cookies, response => {
              // Assert.
              expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
              expect(response.header.location).to.equal('/generic-error');
            }, 'post');
          featureMock(done);
        });
      });
    });
  });
});
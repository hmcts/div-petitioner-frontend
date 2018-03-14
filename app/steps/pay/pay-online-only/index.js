const Step = require('app/core/Step');
const runStepHandler = require('app/core/handler/runStepHandler');
const { features } = require('@hmcts/div-feature-toggle-client')().featureToggles;
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');
const serviceTokenService = require('app/services/serviceToken');
const paymentService = require('app/services/payment');
const submissionService = require('app/services/submission');
const getBaseUrl = require('app/core/utils/baseUrl');

const jwt = require('jsonwebtoken');
const statusCodes = require('http-status-codes');
const CONF = require('config');
const logger = require('@hmcts/nodejs-logging').getLogger(__filename);
const get = require('lodash/get');

module.exports = class PayOnline extends Step {
  get url() {
    return '/pay/online';
  }

  get nextStep() {
    // unused as handler redirects on its own
    return false;
  }

  get middleware() {
    return [applicationFeeMiddleware.updateApplicationFeeMiddleware];
  }

  handler(req, res) {
    const { method, cookies, body } = req;

    const isGetRequest = method.toLowerCase() === 'get';

    // test to see if user has clicked submit button. The form could have been submitted
    // by clicking on save and close
    const hasBeenPostedWithoutSubmitButton = body && Object.keys(body).length > 0 && !body.hasOwnProperty('submit');

    if (isGetRequest || hasBeenPostedWithoutSubmitButton) {
      return runStepHandler(this, req, res);
    }

    // This step does not exist if online submission is not enabled.
    if (!features.onlineSubmission) {
      return res.status(statusCodes.NOT_FOUND).send('Not Found');
    }

    // Fail early if the request is not in the right format.
    if (!cookies || !cookies['connect.sid']) {
      return res.status(statusCodes.BAD_REQUEST).send('Bad request');
    }

    req.session = req.session || {};

    // Some prerequisites. @todo extract these elsewhere?
    let authToken = '';
    let user = {};

    if (features.idam) {
      authToken = req.cookies['__auth-token'];
      user = {
        id: jwt.decode(authToken).id,
        bearerToken: authToken
      };
    }

    // Fee properties below are hardcoded and obtained from config.
    // Eventually these values will be obtained from the fees-register.
    const feeCode = CONF.commonProps.applicationFeeCode;
    const feeDescription = 'Filing an application for a divorce, nullity or civil partnership dissolution – fees order 1.2.';
    // Amount is specified in pence.
    const PENCE_PER_POUND = 100;
    const amount = parseInt(CONF.commonProps.applicationFee) * PENCE_PER_POUND;
    const returnUrl = `${getBaseUrl()}${this.steps.CardPaymentStatus.url}`;
    const caseId = req.session.caseId;
    const siteId = get(req.session, `court.${req.session.courts}.siteId`);

    if (!caseId) {
      // console.log('Case Reference is missing');
      logger.error('Case Reference is missing');
      res.redirect('/generic-error');
    }

    // Initialise services.
    const serviceToken = serviceTokenService.setup();
    const payment = paymentService.setup();
    const submission = submissionService.setup();

    // Get service token and create payment.
    return serviceToken.getToken()
      // Create payment.
      .then(token => {
        return payment.create(user, token, caseId, siteId, feeCode, amount,
          feeDescription, returnUrl);
      })

      // Store payment info in session and update the submitted application.
      .then(response => {
        const { id, state, reference, nextUrl } = response;
        req.session.currentPaymentId = id;
        req.session.payments = Object.assign({}, req.session.payments,
          { [id]: { state, reference, nextUrl } });

        const eventData = submissionService
          .generatePaymentEventData(req.session, response);

        return submission.update(authToken, caseId, eventData, 'paymentReferenceGenerated');
      })

      // If all is well, redirect to payment page.
      .then(response => {
        if (!response || response.status !== 'success') {
          // Fail immediately if the application could not be updated in CCD.
          throw response;
        }

        const id = req.session.currentPaymentId;
        const nextUrl = req.session.payments[id].nextUrl;
        res.redirect(nextUrl);
      })

      // Log any errors occurred and end up on the error page.
      .catch(error => {
        logger.error(`Error during payment initialisation: ${error}`);
        res.redirect('/generic-error');
      });
  }

  // disable check your answers
  get checkYourAnswersTemplate() {
    return false;
  }

  action(ctx, session) {
    session.paymentMethod = 'card-online';
    return [ctx, session];
  }
};

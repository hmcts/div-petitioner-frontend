const jwt = require('jsonwebtoken');
const statusCodes = require('http-status-codes');
const CONF = require('config');
const logger = require('@hmcts/nodejs-logging').getLogger(__filename);
const get = require('lodash/get');

const Step = require('app/core/Step');
const { protect } = require('app/services/idam');
const { features } = require('@hmcts/div-feature-toggle-client')().featureToggles;
const serviceTokenService = require('app/services/serviceToken');
const paymentService = require('app/services/payment');
const submissionService = require('app/services/submission');
const getBaseUrl = require('app/core/utils/baseUrl');
const { updateApplicationFeeMiddleware } = require('app/middleware/updateApplicationFeeMiddleware');

module.exports = class PayByCard extends Step {
  get middleware() {
    const idamProtect = (req, res, next) => {
      return features.idam ? protect()(req, res, next) : next();
    };

    return [idamProtect, updateApplicationFeeMiddleware];
  }

  handler(req, res) {
    // This step does not exist if online submission is not enabled.
    if (!features.onlineSubmission) {
      res.status(statusCodes.NOT_FOUND).send('Not Found');
      return;
    }

    // Fail early if the request is not in the right format.
    const { method, cookies } = req;
    if (method.toLowerCase() !== 'get' || !cookies || !cookies['connect.sid']) {
      res.status(statusCodes.BAD_REQUEST).send('Bad request');
      return;
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
    const feeCode = CONF.commonProps.applicationFee.code;
    const feeDescription = 'Filing an application for a divorce, nullity or civil partnership dissolution – fees order 1.2.';
    // Amount is specified in pence.
    const PENCE_PER_POUND = 100;
    const amount = parseInt(CONF.commonProps.applicationFee
      .fee_amount) * PENCE_PER_POUND;
    const returnUrl = `${getBaseUrl()}${this.steps.CardPaymentStatus.url}`;
    const caseId = req.session.caseId;
    const siteId = get(req.session, `court.${req.session.courts}.siteId`);

    // Initialise services.
    const serviceToken = serviceTokenService.setup();
    const payment = paymentService.setup();
    const submission = submissionService.setup();

    // Get service token and create payment.
    serviceToken.getToken()
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

  get url() {
    return '/pay/by-card';
  }
};

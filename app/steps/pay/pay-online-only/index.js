/* eslint-disable complexity */
const Step = require('app/core/steps/Step');
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');
const serviceTokenService = require('app/services/serviceToken');
const paymentService = require('app/services/payment');
const submissionService = require('app/services/submission');
const getBaseUrl = require('app/core/utils/baseUrl');
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const { restoreFromDraftStore } = require('app/middleware/draftPetitionStoreMiddleware');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');
const { setIdamUserDetails } = require('app/middleware/setIdamDetailsToSessionMiddleware');
const { saveSessionToDraftStoreAndClose } = require('app/middleware/draftPetitionStoreMiddleware');
const requestHandler = require('app/core/helpers/parseRequest');
const idam = require('app/services/idam');
const CONF = require('config');
const logger = require('app/services/logger').logger(__filename);
const get = require('lodash/get');
const parseBool = require('app/core/utils/parseBool');

const feeConfigPropNames = {
  applicationFee: 'applicationFee',
  amendFee: 'amendFee'
};

const feeType = req => {
  return req.session.previousCaseId ? feeConfigPropNames.amendFee : feeConfigPropNames.applicationFee;
};

module.exports = class PayOnline extends Step {
  get url() {
    return '/pay/online';
  }

  get nextStep() {
    // unused as handler redirects on its own
    return false;
  }

  get middleware() {
    return [
      idamProtect,
      initSession,
      sessionTimeout,
      restoreFromDraftStore,
      setIdamUserDetails,
      applicationFeeMiddleware.updateApplicationFeeMiddleware,
      applicationFeeMiddleware.updateAmendFeeMiddleware,
      saveSessionToDraftStoreAndClose
    ];
  }

  interceptor(ctx, session) {
    if (!session.feeToBePaid) {
      ctx.feeToBePaid = session.previousCaseId ? CONF.commonProps.amendFee.amount : CONF.commonProps.applicationFee.amount;
    }
    return ctx;
  }

  handler(req, res, next) {
    const { method, cookies, body } = req;

    const isGetRequest = method.toLowerCase() === 'get';

    // test to see if user has clicked submit button. The form could have been submitted
    // by clicking on save and close
    const hasBeenPostedWithoutSubmitButton = body && Object.keys(body).length > 0 && !body.hasOwnProperty('submit');

    if (isGetRequest || hasBeenPostedWithoutSubmitButton) {
      return super.handler(req, res, next);
    }

    req.session = req.session || {};

    // Some prerequisites. @todo extract these elsewhere?
    let authToken = '';
    let user = {};

    if (parseBool(CONF.features.idam)) {
      authToken = cookies['__auth-token'];

      const idamUserId = idam.userId(req);
      if (!idamUserId) {
        logger.errorWithReq(req, 'user_details_missing', 'User does not have any idam userDetails');
        return res.redirect('/generic-error');
      }

      user = {
        id: idamUserId,
        bearerToken: authToken
      };
    }

    // Fee properties below are hardcoded and obtained from config.
    // Eventually these values will be obtained from the fees-register.

    const feeCode = CONF.commonProps[feeType(req)].feeCode;
    const feeVersion = CONF.commonProps[feeType(req)].version;
    const feeDescription = 'Filing an application for a divorce, nullity or civil partnership dissolution – fees order 1.2.';
    // Amount is specified in pound sterling.
    const amount = parseInt(
      CONF.commonProps[feeType(req)].amount
    );
    const hostParts = req.get('host').split(':');
    // if hostParts is a length of 2, it is a valid hostname:port url
    const port = hostParts.length === 2 ? hostParts[1] : ''; // eslint-disable-line no-magic-numbers
    const baseUrl = getBaseUrl(req.protocol, req.hostname, port);
    const cardPaymentStatusUrl = this.steps.CardPaymentStatus.url;
    const returnUrl = `${baseUrl}${cardPaymentStatusUrl}`;
    const serviceCallbackUrl = parseBool(CONF.features.strategicPay) ? `${CONF.services.transformation.baseUrl}/payment-update` : '';

    const caseId = req.session.caseId;
    const siteId = get(req.session, 'allocatedCourt.siteId');

    if (!caseId) {
      logger.errorWithReq(req, 'case_id_missing', 'Case ID is missing');
      return res.redirect('/generic-error');
    }

    // Initialise services.
    const serviceToken = serviceTokenService.setup();
    const payment = paymentService.setup();
    const submission = submissionService.setup();

    // Get service token and create payment.
    return serviceToken.getToken(req)
      // Create payment.
      .then(token => {
        return payment.create(req, user, token, caseId, siteId, feeCode,
          feeVersion, amount, feeDescription, returnUrl, serviceCallbackUrl);
      })

      // Store payment info in session and update the submitted application.
      .then(response => {
        const { id, status, reference, nextUrl } = response;
        req.session.currentPaymentId = id;
        req.session.currentPaymentReference = reference;
        req.session.payment_reference = reference;
        req.session.payments = Object.assign({}, req.session.payments,
          { [id]: { status, reference, nextUrl } });

        const eventData = submissionService
          .generatePaymentEventData(req.session, response);

        return submission.update(req, authToken, caseId, eventData, 'paymentReferenceGenerated');
      })

      // If all is well, redirect to payment page.
      .then(response => {
        if (!response || response.status !== 'success') {
          // Fail immediately if the application could not be updated in CCD.
          throw response;
        }

        const id = req.session.currentPaymentId;
        const nextUrl = req.session.payments[id].nextUrl;
        req.session.paymentMethod = 'card-online';
        res.redirect(nextUrl);
        next();
      })
      .catch(error => {
        logger.errorWithReq(req, 'payment_error', 'Error occurred while preparing payment details', error.message);
        res.redirect('/generic-error');
      });
  }

  // disable check your answers
  get checkYourAnswersTemplate() {
    return false;
  }
  parseRequest(req) {
    return requestHandler.parse(this, req);
  }
};

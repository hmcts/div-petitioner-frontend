const logger = require('app/services/logger').logger(__filename);
const paymentStatusService = require('app/steps/pay/card-payment-status/paymentStatusService');

const APPLICATION_SUBMITTED_PATH = '/application-submitted';
const DONE_AND_SUBMITTED = '/done-and-submitted';
const APPLICATION_MULTIPLE_REJECTED_CASES_PATH = '/contact-divorce-team';

const handleCcdCase = (req, res, next) => {
  const session = req.session;
  switch (session.state) {
  case 'AwaitingPayment':
    if (session.currentPaymentReference) {
      return paymentStatusService
        .checkAndUpdatePaymentStatus(req)
        .then(response => {
          if (response !== true) return DONE_AND_SUBMITTED;
          return APPLICATION_SUBMITTED_PATH;
        })
        .then(
          url => {
            return res.redirect(url);
          }
        )
        // Log any errors occurred and end up on the error page.
        .catch(error => {
          logger.errorWithReq(req, 'payment_status_error', 'Error checking/updating payment status', error.message);
          return res.redirect('/generic-error');
        });
    }
    logger.infoWithReq(req, 'no_payment_ref', 'AwaitingPayment but payment reference not found');
    return res.redirect(APPLICATION_SUBMITTED_PATH);
  case 'Rejected':
    logger.infoWithReq(req, 'case_rejected', 'Case is in rejected state');
    return next();
  case 'MultipleRejectedCases':
    logger.infoWithReq(req, 'multiple_cases_rejected', 'Multiple cases rejected');
    return res.redirect(APPLICATION_MULTIPLE_REJECTED_CASES_PATH);
  default:
    logger.infoWithReq(req, 'case_done_and_submitted', 'Default case state - redirecting to done and submitted');
    return res.redirect(DONE_AND_SUBMITTED);
  }
};

const hasSubmitted = function(req, res, next) {
  const { session } = req;

  if (session.payment_reference) session.currentPaymentReference = session.payment_reference;
  if (session.caseId && session.state) {
    return handleCcdCase(req, res, next);
  }
  // when a new case has just been submitted for the session
  if (session.caseId) {
    return res.redirect(APPLICATION_SUBMITTED_PATH);
  }

  return next();
};

module.exports = { hasSubmitted };

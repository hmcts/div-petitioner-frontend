const ExitStep = require('app/core/steps/ExitStep');
const paymentService = require('app/services/payment');

const formatAllocatedCourtAddress = session => {
  const allocatedCourt = session.allocatedCourt;
  let formattedAllocatedCourtAddress = '';

  if (allocatedCourt) {
    if (allocatedCourt.serviceCentreName) {
      formattedAllocatedCourtAddress += `${allocatedCourt.serviceCentreName} <br> c/o `;
    }
    formattedAllocatedCourtAddress += `${allocatedCourt.divorceCentre} <br> `;

    if (allocatedCourt.poBox) {
      formattedAllocatedCourtAddress += `${allocatedCourt.poBox} <br> `;
    } else {
      formattedAllocatedCourtAddress += `${allocatedCourt.divorceCentreAddressName} <br> ${allocatedCourt.street} <br> `;
    }

    formattedAllocatedCourtAddress += `${allocatedCourt.courtCity} <br> ${allocatedCourt.postCode}`;
  }

  return formattedAllocatedCourtAddress;
};

module.exports = class DoneAndSubmitted extends ExitStep {
  get url() {
    return '/done-and-submitted';
  }

  interceptor(ctx, session) {
    const paymentResult = paymentService.getCurrentPaymentStatus(session);
    if (session.paymentMethod === 'card-online') {
      ctx.paymentCompleted = paymentResult && paymentResult.toLowerCase() === 'success';
    }

    ctx.courtPostAddress = formatAllocatedCourtAddress(session);

    return super.interceptor(ctx, session);
  }
};
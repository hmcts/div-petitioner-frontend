const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class ClaimCosts extends ValidationStep {
  get url() {
    return '/about-divorce/claim-costs';
  }

  get nextStep() {
    return this.steps.UploadMarriageCertificate;
  }

  constructor(...args) {
    super(...args);

    watch('claimsCosts', (previousSession, session, remove) => {
      if (!session.claimsCosts || session.claimsCosts === 'No') {
        remove(
          'reasonForDivorceAdulteryIsNamed',
          'claimsCostsFrom',
          'claimsCostsAppliedForFees',
          'reasonForDivorceClaiming5YearSeparation',
          'reasonForDivorceClaimingAdultery'
        );
      }
    });

    watch('reasonForDivorce', (previousSession, session, remove) => {
      if (session.reasonForDivorce !== 'adultery') {
        remove('claimsCosts');
      }
    });

    watch('reasonForDivorceAdulteryWishToName', (previousSession, session, remove) => {
      if (session.reasonForDivorceAdulteryWishToName !== 'Yes' && session.claimsCostsFrom && session.claimsCostsFrom.includes('correspondent')) {
        remove('claimsCosts');
      }
    });
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  * validate(ctx) {
    const [isValid, errors] = yield super.validate(ctx);

    const showErrorsForClaimsCosts = error => {
      return error.param === 'claimsCosts';
    };

    const showErrorsForClaimsCostsFrom = error => {
      return error.param === 'claimsCostsFrom';
    };

    if (!isValid) {
      if (!ctx.claimsCosts) {
        return [isValid, errors.filter(showErrorsForClaimsCosts)];
      }
      return [isValid, errors.filter(showErrorsForClaimsCostsFrom)];
    }

    return [isValid, errors];
  }

  interceptor(ctx, session) {
    ctx.claimsCostsAppliedForFees = session.helpWithFeesNeedHelp === 'Yes';
    ctx.reasonForDivorceClaiming5YearSeparation = session.reasonForDivorce === 'separation-5-years';
    ctx.reasonForDivorceClaimingAdultery = session.reasonForDivorce === 'adultery';
    ctx.helpWithFeesReferenceNumber = session.helpWithFeesReferenceNumber;
    if (session.reasonForDivorce === 'adultery' && session.reasonForDivorceAdulteryWishToName === 'Yes') {
      ctx.reasonForDivorceAdulteryIsNamed = 'Yes';
    } else {
      ctx.reasonForDivorceAdulteryIsNamed = 'No';
    }

    return ctx;
  }

  action(ctx, session) {
    if (ctx.claimsCosts === 'No') {
      delete ctx.claimsCostsFrom;
      delete session.claimsCostsFrom;
    } else if (ctx.reasonForDivorceAdulteryIsNamed === 'No') {
      ctx.claimsCostsFrom = ['respondent'];
    }

    return [ctx, session];
  }
};
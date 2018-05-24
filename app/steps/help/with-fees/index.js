const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class WithFees extends ValidationStep {
  get url() {
    return '/pay/help/with-fees';
  }

  get nextStep() {
    return {
      helpWithFeesAppliedForFees: {
        Yes: this.steps.MarriageHusbandOrWife,
        No: this.steps.ExitNoHelpWithFees
      }
    };
  }

  constructor(...args) {
    super(...args);

    watch('helpWithFeesNeedHelp', (previousSession, session, remove) => {
      if (session.helpWithFeesNeedHelp === 'No') {
        remove('helpWithFeesAppliedForFees', 'helpWithFeesReferenceNumber');
      }
    });

    watch('helpWithFeesAppliedForFees', (previousSession, session, remove) => {
      if (!session.helpWithFeesAppliedForFees || session.helpWithFeesAppliedForFees === 'No') {
        remove('helpWithFeesReferenceNumber');
      }
    });
  }

  validate(ctx, session) {
    const [isValid, errors] = super.validate(ctx, session);

    if (isValid) {
      // format reference number so it includes hyphens and HWF
      if (ctx.helpWithFeesReferenceNumber && ctx.helpWithFeesReferenceNumber.length) {
        // remove unwanted characters
        const helpWithFeesReferenceNumber = ctx.helpWithFeesReferenceNumber
          .replace(/HWF/gi, '')
          .replace(/[^a-zA-Z0-9]/gi, '')
          .split('');

        // insert hyphen inbetween two sets of numbers e.g. 123-123
        const HWF_START_INDEX = 3;
        helpWithFeesReferenceNumber
          .splice(HWF_START_INDEX, 0, '-');

        ctx.helpWithFeesReferenceNumber = `HWF-${helpWithFeesReferenceNumber.join('')}`;
      }
    }

    return [isValid, errors];
  }

  checkYourAnswersInterceptor(ctx) {
    return { helpWithFeesReferenceNumber: ctx.helpWithFeesReferenceNumber };
  }

  interceptor(ctx) {
    if (ctx.helpWithFeesAppliedForFees === 'No') {
      delete ctx.helpWithFeesReferenceNumber;
    }
    return ctx;
  }
};

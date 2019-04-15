const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');
const capitalizeName = require('app/core/utils/capitalizeName');

module.exports = class Adultery3rdPartyDetails extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/adultery/name-person';
  }

  get nextStep() {
    return this.steps.Adultery3rdPartyAddress;
  }

  constructor(...args) {
    super(...args);

    watch('reasonForDivorceAdulteryWishToName', (previousSession, session, remove) => {
      if (session.reasonForDivorceAdulteryWishToName !== 'Yes') {
        remove('reasonForDivorceAdultery3rdPartyFirstName', 'reasonForDivorceAdultery3rdPartyLastName');
      }
    });
  }

  action(ctx, session) {
    ctx.reasonForDivorceAdultery3rdPartyFirstName = capitalizeName(ctx
      .reasonForDivorceAdultery3rdPartyFirstName);
    ctx.reasonForDivorceAdultery3rdPartyLastName = capitalizeName(ctx
      .reasonForDivorceAdultery3rdPartyLastName);
    return [ctx, session];
  }
};
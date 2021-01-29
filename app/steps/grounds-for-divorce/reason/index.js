const moment = require('moment');
const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');
const { checkMarriageDate } = require('app/middleware/checkMarriageDateMiddleware');

const datePeriod = require('app/core/utils/datePeriod');
const logger = require('app/services/logger').logger(__filename);

const reasons = {
  behaviour: 'unreasonable-behaviour',
  adultery: 'adultery',
  sep2Yr: 'separation-2-years',
  sep5Yr: 'separation-5-years',
  desertion: 'desertion'
};

module.exports = class ReasonForDivorce extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/reason';
  }

  get nextStep() {
    return {
      reasonForDivorce: {
        'unreasonable-behaviour': this.steps.UnreasonableBehaviour,
        adultery: this.steps.AdulteryWishToName,
        'separation-2-years': this.steps.RespondentConsent,
        'separation-5-years': this.steps.SeparationDateNew,
        desertion: this.steps.DesertionAgree
      }
    };
  }

  constructor(...args) {
    super(...args);

    const reasonForDivorceFields = [
      'reasonForDivorce',
      'reasonForDivorceHasMarriageDate',
      'reasonForDivorceShowAdultery',
      'reasonForDivorceShowUnreasonableBehaviour',
      'reasonForDivorceShowTwoYearsSeparation',
      'reasonForDivorceShowFiveYearsSeparation',
      'reasonForDivorceShowDesertion',
      'reasonForDivorceLimitReasons',
      'reasonForDivorceEnableAdultery',
      'reasonForDivorceTimeUntilReason5Years',
      'reasonForDivorceTimeUntilReason2Years'
    ];

    watch('marriageDate', (previousSession, session, remove) => {
      const timeSinceMarriage = moment().diff(session.marriageDate, 'years');

      const seperationDesertionIsInvalid = ['separation-2-years', 'separation-5-years', 'desertion']
        .includes(session.reasonForDivorce) && timeSinceMarriage >= 1 && timeSinceMarriage <= datePeriod.TWO_YEARS;
      const seperation5YearsIsInvalid = session.reasonForDivorce === 'separation-5-years' && timeSinceMarriage <= datePeriod.FIVE_YEARS;

      if (timeSinceMarriage < 1 || seperationDesertionIsInvalid || seperation5YearsIsInvalid) {
        remove(...reasonForDivorceFields);
      }
    });
  }

  interceptor(ctx, session) {
    //  no marriage date - display nothing
    //  1 - 2 years - adultery, unreasonable behaviour
    //  2 - 5 years - adultery, unreasonable behaviour, 2 year separation, desertion
    //  > 5 years - adultery, unreasonable behaviour, 2 year separation, desertion, 5 year separation

    const marriageDate = session.marriageDate;
    let ignoreDivorceReasons = session.previousReasonsForDivorce;

    if (this.showAllReasonsForDivorce(session)) {
      ignoreDivorceReasons = [];
      logger.infoWithReq(null, '', 'showing all reasons for divorce');
    }

    ctx.reasonForDivorceHasMarriageDate = false;
    ctx.reasonForDivorceShowAdultery = false;
    ctx.reasonForDivorceShowUnreasonableBehaviour = false;
    ctx.reasonForDivorceShowTwoYearsSeparation = false;
    ctx.reasonForDivorceShowFiveYearsSeparation = false;
    ctx.reasonForDivorceShowDesertion = false;
    ctx.reasonForDivorceLimitReasons = true;
    ctx.reasonForDivorceEnableAdultery = true;

    ctx.reasonForDivorceHasMarriageDate = true;
    ctx.reasonForDivorceShowAdultery = true;
    ctx.reasonForDivorceShowUnreasonableBehaviour = true;
    ctx.reasonForDivorceShowTwoYearsSeparation = true;
    ctx.reasonForDivorceShowFiveYearsSeparation = true;
    ctx.reasonForDivorceShowDesertion = true;
    ctx.reasonForDivorceLimitReasons = false;

    const timeSinceMarriage = moment().diff(marriageDate, 'years');

    // remove all previous attempted reasons for divorce
    if (ignoreDivorceReasons && ignoreDivorceReasons.length > 0) {
      ignoreDivorceReasons.forEach(reason => {
        switch (reason) {
        case reasons.adultery:
          ctx.reasonForDivorceShowAdultery = false;
          logger.infoWithReq(null, '', 'hit case adultery');
          break;
        case reasons.behaviour:
          ctx.reasonForDivorceShowUnreasonableBehaviour = false;
          logger.infoWithReq(null, '', 'hit case behaviour');
          break;
        case reasons.desertion:
          ctx.reasonForDivorceShowDesertion = false;
          logger.infoWithReq(null, '', 'hit case desertion');
          break;
        case reasons.sep2Yr:
          ctx.reasonForDivorceShowTwoYearsSeparation = false;
          logger.infoWithReq(null, '', 'hit case two year separation');
          break;
        case reasons.sep5Yr:
          ctx.reasonForDivorceShowFiveYearsSeparation = false;
          logger.infoWithReq(null, '', 'hit case five year separation');
          break;
        default:
          logger.errorWithReq(session.req, 'unknown_reason', `Unknown reason for divorce found: ${reason}`);
        }
      });
    }

    if (timeSinceMarriage < datePeriod.FIVE_YEARS) {
      logger.infoWithReq(null, '', 'removed 5 year separation');
      ctx.reasonForDivorceTimeUntilReason5Years = moment(marriageDate).add(datePeriod.FIVE_YEARS, 'years')
        .format('DD MMMM YYYY');
      ctx.reasonForDivorceShowFiveYearsSeparation = false;
      ctx.reasonForDivorceLimitReasons = true;
    }

    if (timeSinceMarriage < datePeriod.TWO_YEARS) {
      logger.infoWithReq(null, '', 'removed 2 year separation');
      ctx.reasonForDivorceTimeUntilReason2Years = moment(marriageDate).add(datePeriod.TWO_YEARS, 'years')
        .format('DD MMMM YYYY');
      ctx.reasonForDivorceShowTwoYearsSeparation = false;
      ctx.reasonForDivorceShowDesertion = false;
      ctx.reasonForDivorceLimitReasons = true;
    }

    return ctx;
  }

  get middleware() {
    return [
      ...super.middleware,
      checkMarriageDate
    ];
  }

  showAllReasonsForDivorce(session) {
    return session.reasonsForDivorceShowAll === true;
  }
};

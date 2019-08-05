const i18next = require('i18next').createInstance();
const common = require('app/content/common');
const commonJurisdiction = require('app/content/commonJurisdiction');
const { merge } = require('lodash');
const logger = require('app/services/logger').logger(__filename);
const CONF = require('config');

const content = merge(common, commonJurisdiction);

i18next.init(content, error => {
  if (error) {
    logger.errorWithReq(null, 'i18next_error', 'Failed to initialise i18next', error.message);
  }
});
i18next.changeLanguage('en');

function commonContentMiddleware(req, res, next) {
  const i18nProxy = new Proxy(i18next, {
    get: (target, key) => {
      if (target.exists(key)) {
        return target.t(key, {
          pageUrl: req.baseUrl,
          smartSurveyFeedbackUrl: CONF.commonProps.smartSurveyFeedbackUrl,
          courtPhoneNumber: CONF.commonProps.courtPhoneNumber,
          courtOpeningHour: CONF.commonProps.courtOpeningHour,
          courtEmail: CONF.commonProps.courtEmail
        });
      }
      return '';
    }
  });

  req.i18n = i18next;
  res.locals.i18n = i18next;
  res.locals.common = i18nProxy;
  res.locals.content = i18nProxy;
  next();
}

module.exports = commonContentMiddleware;

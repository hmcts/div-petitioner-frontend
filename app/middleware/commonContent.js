const i18next = require('i18next').createInstance();
const { merge } = require('lodash');
const logger = require('app/services/logger').logger(__filename);
const CONF = require('config');

function commonContentMiddleware(req, res, next) {
  const common = require(`app/content/common-${req.session.language}`);
  const commonJurisdiction = require(`app/content/commonJurisdiction-${req.session.language}`);

  const content = merge(common, commonJurisdiction);

  i18next.init(content, error => {
    if (error) {
      logger.errorWithReq(null, 'i18next_error', 'Failed to initialise i18next', error.message);
    }
  });

  i18next.languages = CONF.languages;
  i18next.changeLanguage(req.session.language);

  const i18nProxy = new Proxy(i18next, {
    get: (target, key) => {
      if (target.exists(key)) {
        return target.t(key, {
          pageUrl: req.baseUrl,
          smartSurveyFeedbackUrl: CONF.commonProps.smartSurveyFeedbackUrl,
          courtPhoneNumberEn: CONF.commonProps.courtPhoneNumberEn,
          courtPhoneNumberCy: CONF.commonProps.courtPhoneNumberCy,
          courtOpeningHourEn: CONF.commonProps.courtOpeningHourEn,
          courtOpeningHourEn2: CONF.commonProps.courtOpeningHourEn2,
          courtOpeningHourCy: CONF.commonProps.courtOpeningHourCy,
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

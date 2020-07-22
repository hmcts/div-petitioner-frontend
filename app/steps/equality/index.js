const CONF = require('config');
const Step = require('app/core/steps/Step');
const createToken = require('./createToken');

module.exports = class Equality extends Step {
  get url() {
    return '/equality-and-diversity';
  }

  get nextStep() {
    return this.steps.CheckYourAnswers;
  }

  // disable check your answers
  get checkYourAnswersTemplate() {
    return false;
  }

  static get returnPath() {
    return '/check-your-answers';
  }

  handler(req, res) {
    const params = {
      serviceId: 'DIVORCE',
      actor: 'PETITIONER',
      pcqId: req.session.petitionerPcqId,
      partyId: req.session.petitionerEmail,
      returnUrl: req.headers.host + Equality.returnPath,
      language: req.session.language || 'en'
    };

    params.token = createToken(params);

    // Encode partyId
    params.partyId = encodeURIComponent(params.partyId);

    const qs = Object.keys(params)
      .map(key => {
        return `${key}=${params[key]}`;
      })
      .join('&');

    res.redirect(`${CONF.services.equalityAndDiversity.url}${CONF.services.equalityAndDiversity.path}?${qs}`);
  }
};

const CONF = require('config');
const Step = require('app/core/steps/Step');
const createToken = require('./createToken');

module.exports = class Equality extends Step {
  get url() {
    return '/equality-and-diversity';
  }

  static get returnPath() {
    return '/check-your-answers';
  }

  handler(req, res) {
    const params = {
      serviceId: 'DIVORCE',
      actor: 'PETITIONER',
      pcqId: req.session.pcqId,
      // ccdCaseId: session.form.ccdCase.id,
      partyId: 'todo',
      returnUrl: req.headers.host + Equality.returnPath,
      language: 'en'
    };

    params.token = createToken(params);

    const qs = Object.keys(params)
      .map(key => {
        return `${key}=${params[key]}`;
      })
      .join('&');

    res.redirect(`${CONF.services.equalityAndDiversity.url}${CONF.services.equalityAndDiversity.path}?${qs}`);
  }
};

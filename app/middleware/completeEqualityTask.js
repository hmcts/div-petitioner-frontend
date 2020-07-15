'use strict';

const CONF = require('config');
const get = require('lodash').get;
const uuidv4 = require('uuid/v4');
const request = require('request-promise-native');
const logger = require('app/services/logger')
  .logger(__filename);
const Equality = require('app/steps/equality/index');

const pcqDown = params => {
  return params.res.redirect(Equality.returnPath);
};

const completeEqualityTask = params => {
  if (params.isEnabled && !get(params.req.session, 'petitionerPcqId', false)) {
    const uri = `${CONF.services.equalityAndDiversity.url}/health`;
    request.get({ uri, json: true })
      .then(json => {
        if (json.status && json.status === 'UP') {
          params.req.session.petitionerPcqId = uuidv4();

          return params.next();
        }
        logger.errorWithReq(params.req, 'complete_equality_task', 'PCQ service is DOWN');
        pcqDown(params);
      })
      .catch(error => {
        logger.errorWithReq(params.req, 'complete_equality_task', error.message);
        pcqDown(params);
      });
  } else {
    pcqDown(params);
  }
};

module.exports = completeEqualityTask;

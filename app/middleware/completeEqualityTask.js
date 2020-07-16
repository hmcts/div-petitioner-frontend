'use strict';

const get = require('lodash').get;
const uuidv4 = require('uuid/v4');
const Equality = require('app/steps/equality/index');

const pcqDown = params => {
  return params.res.redirect(Equality.returnPath);
};

const completeEqualityTask = params => {
  if (params.isEnabled && !get(params.req.session, 'petitionerPcqId', false)) {
    params.req.session.petitionerPcqId = uuidv4();
    return params.next();
  }
  pcqDown(params);
};

module.exports = completeEqualityTask;

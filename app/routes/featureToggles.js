'use strict';

const router = require('express').Router();
const FeatureToggle = require('app/core/utils/featureToggle');

const featureToggle = new FeatureToggle();

const fetchAwaitingAmendToggleVariation = (req, res, next) => {
  return featureToggle.callCheckToggle(req, res, next, res.locals.launchDarkly, 'ft_awaiting_amend', featureToggle.toggleFeature);
};

router.use([fetchAwaitingAmendToggleVariation], (req, res, next) => {
  next();
});

router.get('*', (req, res, next) => {
  return featureToggle.callCheckToggle(req, res, next, res.locals.launchDarkly, 'ft_welsh', featureToggle.toggleFeature);
});

module.exports = router;

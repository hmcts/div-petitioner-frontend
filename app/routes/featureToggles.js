'use strict';

const router = require('express')
  .Router();

const featureToggle = new (require('app/core/utils/featureToggle'))();
const completeEqualityTask = require('app/middleware/completeEqualityTask');

const fetchAwaitingAmendToggleVariation = (req, res, next) => {
  return featureToggle.callCheckToggle(req, res, next, res.locals.launchDarkly, 'ft_awaiting_amend', featureToggle.toggleFeature);
};

const fetchRepresentedRespondentJourneyToggleVariation = (req, res, next) => {
  return featureToggle.callCheckToggle(req, res, next, res.locals.launchDarkly, 'ft_represented_respondent_journey', featureToggle.toggleFeature);
};

router.use([fetchAwaitingAmendToggleVariation], (req, res, next) => {
  next();
});

router.get('*', (req, res, next) => {
  return featureToggle.callCheckToggle(req, res, next, res.locals.launchDarkly, 'ft_welsh', featureToggle.toggleFeature);
});

router.use([fetchRepresentedRespondentJourneyToggleVariation], (req, res, next) => {
  next();
});

router.get('/equality-and-diversity', (req, res, next) => {
  return featureToggle.callCheckToggle(req, res, next, res.locals.launchDarkly, 'ft_pcq', completeEqualityTask);
});

module.exports = router;

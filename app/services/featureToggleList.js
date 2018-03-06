const express = require('express');

const router = express.Router();

const { getFeatureToggles } = require('@hmcts/div-feature-toggle-client')().featureToggles;

const statusCode = require('app/core/utils/statusCode');

router.get('/status/feature-toggles', (req, res) => {
  const featureToggleList = getFeatureToggles();

  res.status(statusCode.OK).json(featureToggleList);
});

module.exports = router;

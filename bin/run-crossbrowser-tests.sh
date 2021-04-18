#!/bin/bash
set -ex

# Setup required for Saucelabs environment variables. TEST_URL should be set by CNP
export E2E_FRONTEND_URL=${TEST_URL}
export FEATURE_IDAM=true
export IDAM_API_URL=${IDAM_API_URL:-"https://idam-api.aat.platform.hmcts.net"}
export IGNORE_SESSION_VALIDATION=true

yarn test-crossbrowser-e2e
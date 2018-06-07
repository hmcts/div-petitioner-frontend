#!/bin/bash
set -ex

# Setup required environment variables. TEST_URL should be set by CNP
export E2E_FRONTEND_URL=${TEST_URL}
export E2E_PROXY_SERVER=${E2E_PROXY_SERVER:-"proxyout.reform.hmcts.net:8080"}
export E2E_PROXY_BYPASS=${E2E_PROXY_BYPASS:-"*beta*LB.reform.hmcts.net"}
export E2E_FRONTEND_NODE_ENV=${E2E_FRONTEND_NODE_ENV:-"production"}
export IDAM_API_URL=${IDAM_API_URL:-"https://preprod-idamapi.reform.hmcts.net:3511"}
export FEATURE_TOGGLE_API_URL=${FEATURE_TOGGLE_API_URL:-"http://betaPreProddivorceAppLB.reform.hmcts.net:4002/api/v1/feature-toggle"}
export COURT_PHONENUMBER=${COURT_PHONENUMBER:-"0300 303 0642"}
export COURT_OPENINGHOURS=${COURT_OPENINGHOURS:-"Monday to Friday, 8.30am to 5pm"}
export COURT_EMAIL=${COURT_EMAIL:-"Divorce_Reform_Pro@Justice.gov.uk"}
export E2E_WAIT_FOR_TIMEOUT_VALUE=${E2E_WAIT_FOR_TIMEOUT_VALUE:-15000}
export E2E_WAIT_FOR_ACTION_VALUE=${E2E_WAIT_FOR_ACTION_VALUE:-250}
export CODECEPT_PARAMS=${CODECEPT_PARAMS:-""}

yarn test-e2e ${CODECEPT_PARAMS}
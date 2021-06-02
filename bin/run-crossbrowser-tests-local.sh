#!/bin/bash
set -ex

# Saucelabs details needed during a local test run against CNP environment
export E2E_FRONTEND_URL=${TEST_URL}
export IDAM_API_URL=${IDAM_API_URL:-"https://idam-api.aat.platform.hmcts.net"}
export IGNORE_SESSION_VALIDATION=true
export COURT_PHONENUMBER_EN=${COURT_PHONENUMBER_EN:-"0300 303 0642"}
export COURT_OPENINGHOURS_EN=${COURT_OPENINGHOURS_EN:-"Monday to Friday, 8am to 8pm, Saturday 8am to 2pm"}
export COURT_EMAIL=${COURT_EMAIL:-"contactdivorce@justice.gov.uk"}
export E2E_WAIT_FOR_TIMEOUT_VALUE=${E2E_WAIT_FOR_TIMEOUT_VALUE:-40000}
export E2E_WAIT_FOR_ACTION_VALUE=${E2E_WAIT_FOR_ACTION_VALUE:-250}
export E2E_IDAM_PROXY=${E2E_IDAM_PROXY:-"socks5://localhost:9000"}
export SAUCE_TUNNEL_IDENTIFIER=${SAUCE_TUNNEL_IDENTIFIER:-"reformtunnel"}

./bin/run-crossbrowser-tests.sh
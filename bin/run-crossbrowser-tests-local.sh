#!/bin/bash
set -ex

# Saucelabs details needed during a local test run against CNP environment
export E2E_FRONTEND_URL=${TEST_URL}
export FEATURE_IDAM=${FEATURE_IDAM:-"true"}
export E2E_IDAM_PROXY=${E2E_IDAM_PROXY:-"socks5://localhost:9000"}
export SAUCE_TUNNEL_IDENTIFIER=${SAUCE_TUNNEL_IDENTIFIER:-"saucelabs-overnight-tunnel"}
export IDAM_API_URL=${IDAM_API_URL:-"https://preprod-idamapi.reform.hmcts.net:3511"}

yarn test-crossbrowser-e2e
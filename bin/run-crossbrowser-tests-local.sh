#!/bin/bash
set -ex

# Saucelabs details needed during a local test run against CNP environment
export E2E_FRONTEND_URL=${TEST_URL}
export E2E_IDAM_PROXY=${E2E_IDAM_PROXY:-"socks5://localhost:9000"}
export SAUCE_TUNNEL_IDENTIFIER=${SAUCE_TUNNEL_IDENTIFIER:-"reformtunnel"}

./bin/run-crossbrowser-tests.sh
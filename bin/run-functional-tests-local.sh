#!/bin/bash
set -ex

# Extra default details needed during a local test run against CNP environment
export E2E_FRONTEND_URL=${TEST_URL}
export FEATURE_IDAM=${FEATURE_IDAM:-"true"}
export E2E_PROXY_SERVER=${E2E_PROXY_SERVER:-"socks5://localhost:9000"}

./bin/run-functional-tests.sh
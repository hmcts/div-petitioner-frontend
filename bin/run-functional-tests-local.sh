#!/bin/bash
set -ex

# Extra default details needed during a local test run against CNP environment
export E2E_FRONTEND_URL=${TEST_URL}
export FEATURE_IDAM=${FEATURE_IDAM:-"true"}
export E2E_IDAM_PROXY=${E2E_IDAM_PROXY:-"socks5://localhost:9000"}

./bin/run-functional-tests.sh
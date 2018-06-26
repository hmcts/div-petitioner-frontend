#!/bin/bash
set -ex

# Extra default details needed during a local test run
export E2E_FRONTEND_URL=${TEST_URL}
export E2E_PROXY_SERVER=${E2E_PROXY_SERVER:-"proxyout.reform.hmcts.net:8080"}
export E2E_PROXY_BYPASS=${E2E_PROXY_BYPASS:-"*beta*LB.reform.hmcts.net"}

./bin/run-functional-tests.sh
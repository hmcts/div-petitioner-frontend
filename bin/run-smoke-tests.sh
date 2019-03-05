#!/bin/bash
set -ex

export E2E_PROXY_SERVER=${E2E_PROXY_SERVER:-"proxyout.reform.hmcts.net:8080"}
export E2E_PROXY_BYPASS=${E2E_PROXY_BYPASS:-"*beta*LB.reform.hmcts.net"}

NODE_ENV=testing NODE_PATH=. ./node_modules/.bin/codeceptjs run -c test/end-to-end/smoke.conf.js --reporter mocha-multi

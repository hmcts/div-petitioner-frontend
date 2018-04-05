#!/bin/bash

function clean {
    exit 0;
}

trap clean SIGINT SIGTERM

until curl -k https://localhost:8080/healthcheck; 
do
    echo "Waiting for frontend to start"
    sleep 5;
done

./xvfb-run.sh yarn test-e2e

docker-compose -f docker/test-compose.yaml down
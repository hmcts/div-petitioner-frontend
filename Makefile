.PHONY: all test clean foo

COMPOSE_FILE=docker/dev-compose.yaml
PROJECT=frontend

jenkins:
	@: $(eval COMPOSE_FILE=docker/jenkins-compose.yaml)
	@: $(eval PROJECT=$(BUILD_TAG))

define compose
	( \
		echo "docker-compose -p $(PROJECT) -f $(COMPOSE_FILE) $(1)"; \
		docker-compose -p $(PROJECT) -f $(COMPOSE_FILE) $(1); \
	); \
	result=$$?; \
	(docker-compose -p $(PROJECT) -f $(COMPOSE_FILE) run frontend chown -R $(user_id):$(user_id) .); \
	exit $$result;
endef

user_id=$(shell id -u `whoami`)

build: export GIT_REVISION = $(shell git rev-parse HEAD)
build:
	@$(call compose, build --pull)

install:
	@$(call compose, run frontend yarn install)

up down start stop pull:
	@$(call compose, $@)

coverage test test-validation test-unit test-nsp test-coverage eslint setup:
	@$(call compose, run frontend yarn run $@)

start-debug start-dev:
	@$(call compose, run --service-ports frontend yarn run $@)

test-e2e test-a11y:
	@$(call compose, run codecept /bin/sh -c "xvfb-run npm run $@")

clean:
	docker-compose -p $(PROJECT) -f $(COMPOSE_FILE) down
	docker run -v `pwd`:/opt/app -t divorce/frontend:master /bin/sh -c "rm -rf /opt/app/node_modules/*"
	docker run -v `pwd`:/opt/app -t divorce/frontend:master /bin/sh -c "(rm /opt/app/core.* 2>/dev/null && echo 'WARNING: Core dump found, deleting to prevent the build from breaking') || true"
	docker-compose -p $(PROJECT) -f $(COMPOSE_FILE) down

bash:
	@$(call compose, run frontend bash)

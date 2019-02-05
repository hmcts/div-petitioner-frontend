FROM hmcts.azurecr.io/hmcts/base/node/stretch-slim-lts-8:latest as base
RUN apt-get update && apt-get install -y bzip2 git python2.7 python-pip
COPY package.json yarn.lock ./
RUN yarn && npm rebuild node-sass && yarn setup \
    && chown -R hmcts:hmcts $WORKDIR/node_modules

FROM base as runtime
COPY . .
EXPOSE 8080
USER hmcts

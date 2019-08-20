FROM hmctspublic.azurecr.io/base/node/stretch-slim-lts-10:10-stretch-slim as base
USER root
RUN apt-get update && apt-get install -y bzip2 git python2.7 python-pip
COPY package.json yarn.lock ./
RUN yarn && npm rebuild node-sass

FROM base as build
COPY . .
RUN yarn setup && rm -rf node_modules

FROM base as runtime
COPY --from=build $WORKDIR ./
USER hmcts
EXPOSE 3000

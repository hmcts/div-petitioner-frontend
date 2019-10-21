FROM hmctspublic.azurecr.io/base/node/alpine-lts-10:10-alpine as base
COPY package.json yarn.lock ./
RUN yarn && npm rebuild node-sass

FROM base as build
COPY . .
RUN yarn setup && rm -r node_modules/ && yarn install --production && rm -r ~/.cache/yarn

FROM base as runtime
COPY --from=build $WORKDIR ./
USER hmcts
EXPOSE 3000

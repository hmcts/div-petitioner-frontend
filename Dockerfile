# ---- Base image ----
FROM hmctspublic.azurecr.io/base/node:16-alpine as base
USER root
RUN apk add git
USER hmcts
COPY --chown=hmcts:hmcts . .
RUN yarn install --production \
  && yarn cache clean

# ---- Runtime image ----
FROM base as runtime
COPY . .
EXPOSE 3000

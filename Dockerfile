# ---- Base image ----
FROM hmctspublic.azurecr.io/base/node:20-alpine AS base
USER root
RUN corepack enable && \
    apk add git
USER hmcts
COPY --chown=hmcts:hmcts . .
RUN yarn install && yarn cache clean

# ---- Runtime image ----
FROM base AS runtime
COPY . .
EXPOSE 3000

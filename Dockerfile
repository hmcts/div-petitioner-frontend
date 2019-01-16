# ---- Base image ----
FROM node:8.12.0-slim as base
ENV WORKDIR=/opt/app \
    APP_USER=hmcts
WORKDIR ${WORKDIR}
RUN addgroup --system --gid 1001 $APP_USER \
    && adduser --system --gid 1001 -uid 1001 --disabled-password --disabled-login $APP_USER \
    && chown -R $APP_USER:$APP_USER $WORKDIR \
    && apt-get update \
    && apt-get install -y git bzip2
COPY package.json yarn.lock ./
RUN yarn install --production \
    && yarn cache clean

# ---- Build image ----
# This images pulls the needed dev dependencies
# then builds the different bundles and finally
# Removes node dependencies for next images
# build convenience
FROM base as build
RUN yarn install \
    && yarn cache clean
COPY . .
RUN yarn setup && rm -rf node_modules/

# ---- Runtime image ----
# This is the runtime image, inheriting from
# the build artifacts and the production dependencies.
# For security compliance, the application
# is executed by the hmcts user.
FROM base as runtime
COPY --from=build $WORKDIR ./
USER $APP_USER
EXPOSE 8080
CMD [ "yarn", "start" ]

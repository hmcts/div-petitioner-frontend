FROM node:8.9.4-alpine

WORKDIR /opt/app

ARG NODE_ENV=production

ENV NODE_ENV=$NODE_ENV

COPY . /opt/app

RUN apk update && \
    apk add --no-cache bash make g++ git python2

RUN yarn install --production=false && yarn setup

RUN rm -rf node_modules \
    && yarn install \
    && yarn cache clean

CMD [ "yarn", "start" ]

FROM node:8.9.4-alpine

WORKDIR /opt/app

ARG NODE_ENV=production

ENV NODE_ENV=$NODE_ENV

COPY . /opt/app

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

RUN yarn install && yarn setup && yarn cache clean

CMD [ "yarn", "start" ]

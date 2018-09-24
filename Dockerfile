FROM node:8.9.4-alpine

WORKDIR /opt/divorce-frontend

ARG NODE_ENV=production

ENV NODE_ENV=$NODE_ENV
ENV NODE_PATH=.

COPY . /opt/divorce-frontend

RUN apk update && \
    apk add make g++ python2

RUN yarn install && npm rebuild node-sass && yarn setup

CMD [ "yarn", "start" ]

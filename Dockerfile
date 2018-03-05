FROM divorce/yarn:8

WORKDIR /opt/app

ARG NODE_ENV=production
ARG GIT_REVISION

ENV GIT_REVISION=$GIT_REVISION \
    NODE_ENV=$NODE_ENV

COPY . /opt/app
RUN yarn && yarn setup && yarn cache clean

CMD [ "yarn", "start" ]

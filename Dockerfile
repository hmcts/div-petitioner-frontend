FROM node:8.12.0-stretch

WORKDIR /opt/app

COPY . /opt/app
RUN yarn && yarn setup && yarn cache clean

CMD [ "yarn", "start" ]

EXPOSE 8080

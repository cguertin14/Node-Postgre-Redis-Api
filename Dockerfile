FROM node:latest

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm i -g pm2 babel-cli
RUN npm i

EXPOSE 5000

CMD ["pm2-dev", "deployment/process-dev.yml"]
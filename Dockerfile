FROM composer:latest as COMPOSER

FROM php:latest as PHP
COPY --from=COMPOSER /usr/bin/composer /usr/bin/composer
RUN apt-get update && apt-get install -y zip unzip
RUN mkdir -p /usr/local/content/node
WORKDIR /usr/local/content/node
ADD https://nodejs.org/dist/v18.16.1/node-v18.16.1-linux-x64.tar.gz .
RUN tar -xzf node-v18.16.1-linux-x64.tar.gz \
    && ln -s /usr/local/content/node/node-v18.16.1-linux-x64/bin/node /usr/local/bin/node \
    && ln -s /usr/local/content/node/node-v18.16.1-linux-x64/bin/npm /usr/local/bin/npm \
    && chown -R root:root /usr/local/content/node \
    && rm -fR node-v18.16.1-linux-x64.tar.gz
RUN npm -g install grunt-cli

RUN mkdir -p /usr/local/content/app
ADD ./ /usr/local/content/app
WORKDIR /usr/local/content/app
RUN cp config.dev.js config.js
RUN cp sync/config.dev.php sync/config.php
RUN npm i -d && composer install
RUN /usr/local/content/node/node-v18.16.1-linux-x64/bin/grunt
RUN cd sync && php run.php

FROM nginx:latest
RUN mkdir -p /usr/local/content/app
COPY --from=PHP /usr/local/content/app/public/build /usr/local/content/app
COPY default.conf /etc/nginx/conf.d
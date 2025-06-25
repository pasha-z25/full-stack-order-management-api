FROM node:20-alpine

WORKDIR /server

COPY . .

RUN rm -rf node_modules package-lock.json

RUN npm install

EXPOSE 8888

FROM node:22-alpine

WORKDIR /app

COPY . .

RUN rm -rf node_modules package-lock.json

RUN npm install

EXPOSE 3000

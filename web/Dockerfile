FROM --platform=linux/amd64 node:20.18.0-alpine

WORKDIR /app

COPY . .

RUN rm -rf node_modules package-lock.json .next

RUN npm cache clean --force 
RUN npm install --include=optional 
RUN npm rebuild lightningcss --build-from-source --verbose

RUN ls -la /app/node_modules/lightningcss

EXPOSE 3000

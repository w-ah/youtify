FROM docker.io/buildkite/puppeteer:latest AS base

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install ffmpeg sox youtube-dl -y

FROM base AS packages

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

FROM packages AS app

COPY . .

EXPOSE 8080

CMD [ "node", "src" ]

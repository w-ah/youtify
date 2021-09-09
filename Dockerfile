FROM docker.io/node:latest AS puppeteer

RUN apt-get update
RUN apt-get install libnss3 -y

FROM puppeteer AS base

RUN apt-get update
RUN apt-get install ffmpeg sox youtube-dl python-pip -y
RUN pip install youtube-dl

FROM base AS packages

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

FROM packages AS app

COPY . .

EXPOSE 7080

CMD [ "node", "src" ]

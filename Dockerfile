FROM node

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080

# Install
RUN apk add --no-cache make gcc g++ python && \
  npm install --production --silent && \
  apk del make gcc g++ python

# Install python/pip
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

# Chrome headless
RUN apk update && apk add --no-cache nmap && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
      chromium \
      harfbuzz \
      "freetype>2.8" \
      ttf-freefont \
      nss

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV YOUTIY_CHROME_PATH=/usr/bin/chromium-browser

# Other
RUN apk add ffmpeg sox youtube-dl

RUN npm install

CMD [ "node", "src" ]

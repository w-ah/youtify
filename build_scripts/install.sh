#! /bin/bash

# install libs
sudo yum install ffmpeg sox python3 python-pip3 youtube-dl -y

# install python packages
pip3 install shazamio
pip3 install lizard

# install node packages
sudo ln -s "$(which node)" /usr/bin/node
sudo ln -s "$(which npm)" /usr/bin/npm
npm i

# setup shell aliases
alias npm='npq-hero'

# install get_iplayer
# https://github.com/get-iplayer/get_iplayer/archive/refs/tags/v3.27.zip

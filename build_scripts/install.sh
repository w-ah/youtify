#! /bin/bash

# install libs
sudo yum install ffmpeg sox python3 -y

# install python packages
pip install shazamio

# install node packages
sudo ln -s "$(which node)" /usr/bin/node
sudo ln -s "$(which npm)" /usr/bin/npm
npm i

# install get_iplayer
# https://github.com/get-iplayer/get_iplayer/archive/refs/tags/v3.27.zip

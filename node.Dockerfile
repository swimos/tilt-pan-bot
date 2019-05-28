FROM node:11-stretch
# FROM resin/raspberrypi3-debian:jessie
# FROM balenalib/armv7hf-debian-node:10.15.3-jessie
# FROM ubuntu/16.04

ENV CONFIG=localhost

WORKDIR /tilt-pan-bot/node/

# RUN /bin/bash -c 'curl -sL https://deb.nodesource.com/setup_12.x | bash -'
# RUN /bin/bash -c 'apt-get install nodejs -y'
# RUN /bin/bash -c 'apt-get update -y'

RUN apt-get update -y && \
    apt-get install -y build-essential python3 python3-pip libpython3-dev apt-utils python3-smbus
    # apt-get install -y libxml2 libxml2-dev bison flex libcdk5-dev libavahi-client-dev cmake git python-dev gcc libboost-python-dev libpython3-dev
# RUN apt-get install -y libxml2 libxml2-dev bison libcdk5-dev libavahi-client-dev libudev-dev libusb-1.0-0 libusb-1.0-0-dev libkrb5-dev
# RUN apt-get install gcc-4.8 g++-4.8 
# RUN export CXX=g++-4.8

RUN /bin/bash -c 'apt-get update -y'

RUN pip3 install --upgrade pip
RUN pip3 install --upgrade setuptools
RUN pip3 install websocket-client
RUN pip3 install adafruit-circuitpython-neopixel
RUN pip3 install pantilthat
# RUN /bin/bash -c 'npm install -g node-gyp node-pre-gyp --unsafe-perm'
# RUN /bin/bash -c 'npm install -g serialport --unsafe-perm'
# RUN /bin/bash -c 'npm install -g node-hid --unsafe-perm'
# RUN /bin/bash -c 'npm install -g dualshock-controller'

COPY /config/node/. /tilt-pan-bot/config/node/.
COPY /node/. /tilt-pan-bot/node/.
COPY /node/lib/. /tilt-pan-bot/node/lib/.
COPY /python-ml/. /tilt-pan-bot/python-ml/.
COPY /tiltPanHat/. /tilt-pan-bot/tiltPanHat/.

# WORKDIR /tilt-pan-bot/node/

RUN /bin/bash -c 'npm install'
# RUN /bin/bash -c 'npm install node-hid --unsafe-perm'
# RUN /bin/bash -c 'npm install dualshock-controller --unsafe-perm'

RUN echo "Start ${CONFIG}"

ENTRYPOINT ["npm","start", "config=${CONFIG}"]

EXPOSE 8080
EXPOSE 5620

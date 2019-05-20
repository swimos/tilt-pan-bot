FROM openjdk:11-jdk-stretch

WORKDIR /

COPY /server/. /tilt-pan-bot/server/.
COPY /server/gradle/wrapper/. /tilt-pan-bot/server/gradle/wrapper/.
COPY /server/src/main/java/. /tilt-pan-bot/server/src/main/java/.
COPY /server/src/main/java/swim/. /tilt-pan-bot/server/src/main/java/swim/.
COPY /server/src/main/java/swim/facedetect/. /tilt-pan-bot/server/src/main/java/swim/facedetect/.
COPY /server/src/main/java/swim/facedetect/agent/. /tilt-pan-bot/server/src/main/java/swim/facedetect/agent/.
COPY /server/src/main/java/swim/facedetect/introspection/. /tilt-pan-bot/server/src/main/java/swim/facedetect/introspection/.

WORKDIR /tilt-pan-bot/server/

RUN /bin/bash -c './gradlew build'
RUN /bin/bash -c 'mkdir dist'
RUN /bin/bash -c 'tar -xf build/distributions/swim-face-detect-3.9.1.tar -C dist/'

ENTRYPOINT ["./dist/swim-face-detect-3.9.1/bin/swim-face-detect"]

EXPOSE 9001

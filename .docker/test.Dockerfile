FROM node:22.14.0-alpine

RUN apk add --no-cache bash
RUN npm i -g @nestjs/cli typescript ts-node

COPY ../package*.json /tmp/app/
RUN cd /tmp/app && npm install

COPY ../ /usr/src/app

COPY ../scripts/wait-for-it.sh /opt/wait-for-it.sh

RUN chmod +x /opt/wait-for-it.sh

COPY ../scripts/startup.test.sh /opt/startup.test.sh

RUN chmod +x /opt/startup.test.sh
RUN sed -i 's/\r//g' /opt/wait-for-it.sh
RUN sed -i 's/\r//g' /opt/startup.test.sh


# Copy .env.test as .env
COPY ../.env.test /usr/src/app/.env

WORKDIR /usr/src/app


CMD ["/opt/startup.test.sh"]
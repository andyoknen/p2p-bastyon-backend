FROM node:20-slim

RUN apt-get update && apt-get install -y curl g++ make python3 pkg-config

EXPOSE 3000
WORKDIR /usr/src/app
COPY . .

ENV DB_FILE_NAME=file:/db/local.db
RUN npm install && npx drizzle-kit push && npm run build

ENTRYPOINT [ "/usr/local/bin/node", "server.js" ]

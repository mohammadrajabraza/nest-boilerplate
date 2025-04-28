#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh postgres:5432
/opt/wait-for-it.sh maildev:1080

# Increase memory limit to 2GB
export NODE_OPTIONS="--max-old-space-size=8192"

npm install
npm run migration:run
npm run seed:run
npm run start:dev

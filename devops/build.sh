#!/bin/bash

#npx ng build --configuration production

sudo docker-compose -f ./docker-compose.yml build --no-cache
sudo docker compose -f ./docker-compose.yml up -d

#! /bin/bash

echo "delivering..."

ssh $DOCKER_USER@$DOCKER_HOST -t "cp /home/$DOCKER_USER/work/gitrepo/env_file_name $DOCKER_BUILD/$DOCKER_MMJ_101/mail-handler-api/; \
cd $DOCKER_BUILD/$DOCKER_MMJ_101/mail-handler-api ; \
cp $DOCKER_BUILD/$DOCKER_MMJ_101/mail-handler-api/jenkins/scripts/docker-compose.yml . ; \
docker compose down ; \
docker build -t mail-handler-api .; \
docker compose up -d "

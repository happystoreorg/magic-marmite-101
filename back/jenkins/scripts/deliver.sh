#! /bin/bash

echo "Build and delivering backend ..."

ssh $DOCKER_USER@$DOCKER_HOST -t "cp /home/$DOCKER_USER/work/gitrepo/env_file_name $DOCKER_BUILD/$DOCKER_MMB_101/back/; \
cd $DOCKER_BUILD/$DOCKER_MMB_101/back ; \
cp $DOCKER_BUILD/$DOCKER_MMB_101/back/jenkins/scripts/docker-compose.yml . ; \
docker compose down ; \
docker compose up -d "

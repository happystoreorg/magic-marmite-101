#! /bin/bash

echo "Build and delivering frontend ..."

ssh $DOCKER_USER@$DOCKER_HOST -t "cp /home/$DOCKER_USER/work/gitrepo/env_file_name $DOCKER_BUILD/$DOCKER_MMF_101; \
cd $DOCKER_BUILD/$DOCKER_MMF_101/front ; \
cp $DOCKER_BUILD/$DOCKER_MMF_101/front/jenkins/scripts/docker-compose.yml . ; \
npm run build ; \
docker build -t $DOCKER_MMF_101 . ; \
docker compose down ; \
docker compose up -d "

#!/usr/bin/env groovy
pipeline {
    agent any
    options {
        skipStagesAfterUnstable()
    }
    stages {
        stage('Build Backend end UI') {
            steps {
               sh 'cd back && chmod +x ./jenkins/scripts/deliver.sh && ./jenkins/scripts/deliver.sh && cd ..'
            }
        }
        stage('Build Frontend API') {
            steps {
               sh 'cd front && chmod +x ./jenkins/scripts/deliver.sh && ./jenkins/scripts/deliver.sh && cd ..'
            }
        }
        stage('Build Mail handler API') {
            steps {
                echo 'mail-handler-api building...'
                sh 'cd ./mail-handler-api && pwd && ./mvnw -B -DskipTests clean package'
                sh 'cd ./mail-handler-api && pwd && chmod +x ./jenkins/scripts/deliver.sh && ./jenkins/scripts/deliver.sh && cd ..'
            }
        }
    }
}

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
    }
}

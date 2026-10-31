pipeline {
    agent any

    tools {
        // Configure a NodeJS installation named 'node-20' (20.x) in Manage Jenkins > Tools (NodeJS plugin)
        // Jenkins runs on Windows here, so shell steps use 'bat' instead of 'sh'
        nodejs 'node-22'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 20, unit: 'MINUTES')
    }

    environment {
        CI = 'true'
        npm_config_cache = "${WORKSPACE}/.npm-cache"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                bat 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                bat 'npm run test:coverage'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'test-results/junit.xml'
                }
            }
        }

        stage('Security Audit') {
            steps {
                // Report only: do not fail the build on known vulnerabilities
                bat(script: 'npm audit --audit-level=high', returnStatus: true)
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Archive') {
            steps {
                archiveArtifacts artifacts: 'dist/**, coverage/lcov-report/**', fingerprint: true, allowEmptyArchive: false
            }
        }
    }

    post {
        success {
            echo 'Frontend CI passed.'
        }
        failure {
            echo 'Frontend CI failed.'
        }
        cleanup {
            cleanWs()
        }
    }
}

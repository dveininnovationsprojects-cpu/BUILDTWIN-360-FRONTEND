pipeline {
    agent any

    tools {
        // Configure a NodeJS installation named 'node-20' in Manage Jenkins > Tools (NodeJS plugin)
        nodejs 'node-20'
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
                sh 'node --version && npm --version'
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test:coverage'
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
                sh 'npm audit --audit-level=high || true'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
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

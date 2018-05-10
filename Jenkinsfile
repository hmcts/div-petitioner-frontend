#!groovy

properties(
  [[$class: 'GithubProjectProperty', projectUrlStr: 'https://github.com/hmcts/div-petitioner-frontend/'],
   pipelineTriggers([[$class: 'GitHubPushTrigger']])]
)

@Library(['Reform', 'Divorce']) _

buildNode {
  try {
    checkoutRepo()

    onDevelop {
      stage('Develop Branch SNAPSHOT') {
        sh '''
          sed -i '/version/ s/",/-SNAPSHOT",/' package.json
        '''
      }
    }

    env.DEPLOYED_SHA = gitSha()

    env.FRONTEND_TAG = dockerTagify(env.BRANCH_NAME)
    buildDockerImage('divorce/frontend', env.FRONTEND_TAG)

    make 'jenkins pull', name: "Pull latest images"

    withEnv([ "NODE_ENV='development'" ]) {
      make 'jenkins install', name: 'Install Dev Dependencies'
    }

    make 'jenkins eslint', name: 'Lint'
    make 'jenkins test:nsp', name: 'Security'

    stage('Unit Test and Coverage') {
      sh 'yarn setup'
      sh 'yarn test:coverage'

      onPR {
        sh "yarn sonar-scanner -Dsonar.analysis.mode=preview -Dsonar.host.url=${env.SONARQUBE_URL}"
      }

      if (env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'master') {
        sh "yarn sonar-scanner -Dsonar.host.url=${env.SONARQUBE_URL}"
      }

    }
    stage('A11y Test') {
      sh 'yarn test:a11y'
    }
    make 'jenkins test-e2e', name: 'End to End Test'

    if (env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'master') {
      env.DEPLOYED_VERSION = publishNodeRPM()
    }

  } finally {
    make 'jenkins clean', name: 'Clean'
  }

}

if (env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'master') {
  deploy app: 'frontend', version: env.DEPLOYED_VERSION, sha: env.DEPLOYED_SHA
}

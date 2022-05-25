# Divorce Petitioner Frontend [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This repo is for the frontend part of the journey that the petitioner will go through to apply for a divorce.

## Setup

**Config**

For development only config, rename the `config/development_template.yaml` file to `config/development.yaml`. Running the app with the node environment set to `development` will ensure this file is used.
This file is not version controlled so any config here will not be pushed to git.

Note that the application will not work if an invalid LanuchDarkly SDK Key in provided. So either get a valid key from azure divorce key store,
or disable it altogether by setting `featureToggles` `enabled` to `false` in `config/default.yaml`.

**Building locally**

You need to have Yarn and Redis installed. This can be done with brew as follows:
```
brew install yarn
brew install redis
```

If it's your first time running the app then run this command to setup the Grunt config files:
```
yarn setup
```

If necessary you can run redis via docker using:
```
docker-compose up redis
```

To run the front end app, run the following from the front end project root folder:
```
yarn add redis-server & yarn dev
```

The application will now be running on ```https://localhost:3000```.

To run the tests and lint, run the following:
```
yarn test
yarn lint
```


**Building with Docker**

To begin download the azure client cli
```
brew update && brew install azure-cli
```

After it has finished downloaded run:
```
az login
```

This should open a browser window for you to login, use your HMCTS account

After logging in run the following command:
```
az acr login --name hmctspublic --subscription DCD-CNP-Prod
az acr login --name hmctsprivate --subscription DCD-CNP-Prod
```

To build the docker containers afresh:
```
make build
```


**Install dependencies**

To install NPM dependencies (This installs the dev dependencies to your local folder):
```
make install
```

**Start the app**
```
make dev
```

The application will now be running on  ```https://localhost:3000```.

## Running locally but pointing to real AAT services

This allows you to run the app while connecting to real IDAM/COS/Payment etc.. services in AAT

* Make a copy of `config/example-local-aat.yaml` as `local-aat.yaml` (this file is .gitignored and shouldn't be commited to git because it contains secrets)
* Copy the secrets into _local-aat.yaml_ - the secret values can be found in the `div-aat` vault in the Azure portal
* Remove the conditional in `app/middleware/draftPetitionStoreMiddleware.js` to always use the real `transformationServiceClient` (this is temporary and should be removed)
* Connect to the VPN
* Run the app using `yarn dev-aat`

##  Testing

All commands from the package.json are available through make. They will be run
inside a docker container, ensuring a consistent dev environment.

For example:
```
make test
make test-unit
make test-e2e
make lint
...
```
### Running additional tests in the Jenkins PR Pipeline

1. Add one or more appropriate labels to your PR in GitHub. Valid labels are:

- ```enable_mutation_test```
- ```enable_fortify_scan```
- ```enable_full_functional_test```
- ```enable_all_tests_and_scans```

2. Trigger a build of your PR in Jenkins.  Once the regular pipeline completes, the nightly pipeline will trigger to execute your chosen test(s).

## Licensing

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

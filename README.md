# Divorce Frontend

The Apply for Divorce frontend.

## Development

### Setup

Configure your local docker daemon with the settings documented in
[reform/docker][reform-docker].

### Build the container

To build the docker containers afresh:

```
> make build
```

### Install dependencies

To install NPM dependencies:

```
> make install
```

This installs the dev dependencies to your local folder.

### Start the app

```
> make start-dev
```

###  Run the tests

All commands from the package.json are available through make. They will be run
inside a docker container, ensuring a consistent dev environment.

For example:

```
> make test
> make test-unit
> make test-e2e
> make lint
> ...
```

### Running Locally Without Docker
If you have any problems configuring Docker locally, you can still run without using Docker locally.
You need to have yarn and redis installed. This can be done with brew as follows:

```
> brew install yarn
> brew install redis

```

To run the front end app, run the following from the front end project root folder:


```
> yarn install
> redis-server &
> yarn start-dev

```


[reform-docker]: http://git.reform/reform/docker

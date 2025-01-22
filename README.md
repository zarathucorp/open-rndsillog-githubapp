# indulgentia-github

> A GitHub App built with [Probot](https://github.com/probot/probot) that "indulgentia-github" GitHub Module

## Before Setup
You need the following information:
1. Azure blob storage
   - CONNECTION_STRING
   - CONTAINER_NAME
2. Supabase
   - SUPABASE_URL
   - SUPABASE_KEY
3. indulgentia-back URL

## Setup

### Register indulgentia-github

1. Register your own "indulgentia-github"

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

2. Visit http://localhost:3000 to see something like this:

![Rndsillog Probot Setup Wizard Example](./public/rndsillog-probot-setup-wizard.svg)

3. Click the Register GitHub App button.
4. Set a unique "indulgentia-github" name.
5. After registering your GitHub App, you'll be redirected to install the app on any repositories. Your local .env file will be populated with values GitHub sends during the redirect.
6. Before starting your "indulgentia-github", you must set .env (or docker env parameter) like this:

```.env
# Azure
CONNECTION_STRING=<blob-storage-connection-string>
CONTAINER_NAME=<blob-storage-container-name>

# Supabase
SUPABASE_URL=<supabase-URL>
SUPABASE_KEY=<supabase-service_role-key>

# API Server
API_SERVER_URL=<indulgentia-back-URL>
``` 
> **(info)** You can set "indulgentia-github" separately from "indulgentia-front" & "indulgentia-back" by fixing "open-rndsillog-network".

7. Now you are ready to go! Please follow the instructions of "open-rndsillog-network".

### Start using Docker

```sh
# 1. Build container
docker build -t indulgentia-github .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> indulgentia-github
```

## Contributing

If you have suggestions for how "indulgentia-github" could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2024 Changwoo Lim

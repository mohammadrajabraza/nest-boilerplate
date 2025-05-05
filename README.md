# 🚀 Getting Started (Local Development)
This project uses Docker Compose for local development. Follow the steps below to get up and running.

## ✅ Prerequisites
- [Docker](https://docs.docker.com/engine/) and [Docker Compose](https://docs.docker.com/compose/) installed, or alternatively [Docker Desktop](https://docs.docker.com/desktop/).

  Then, check with:
  ```bash
    $ docker --version
    $ docker compose version
  ```
- Copy the `dump.sql` file in the project root (In case you want to restore an existing database).
## 📁 Project Structure
Key files and folders:
```
.
├── .env                      # Env variables
├── Dockerfile.dev            # Dockerfile for dev environment
├── docker-compose.dev.yaml   # Docker Compose config for development
├── dump.sql (optional)       # DB seed/init file
├── env-example               # Sample of env file
├── src/                      # Main app code
└── ...
```

## ⚙️ Setup Instructions
### 1. Clone the repo
```bash
  $ git clone https://github.com/your-org/nest-boilerplate.git
  $ cd nest-boilerplate
```

### 2. Configure environment variables
Copy `.env-example` to `.env` and update values:
```bash
  $ cp env-example .env
```

### 3. Start the services
```bash
  $ docker compose -f docker-compose.dev.yaml up --build
```
>This  will:  
>- Start PostgreSQL on port `5401`
>- Run database migrations
>- Start the NestJS app in watch mode (with `npm run start:dev`)

### 4. Access the app
Visit: http://localhost:3000 (or your defined `${APP_PORT}`)


## 🐳 Useful Docker Commands
- Rebuild containers:

  ```bash
  $ docker compose -f docker-compose.dev.yaml up --build
  ```

- Stop containers:

  ```bash
  $ docker compose -f docker-compose.dev.yaml down
  ```

- View logs:
  ```bash
  $ docker compose -f docker-compose.dev.yaml logs -f
  ```

- Access NestJS container shell:
  ```bash
  $ docker exec -it nest_app sh
  ```
  
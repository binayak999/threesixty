# Running with Docker

Set your MongoDB connection string, then run the stack:

```bash
export MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/threesixtynepal"
docker compose up --build
```

Or create a `.env` in the project root:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/threesixtynepal
```

Then:

```bash
docker compose up --build
```

- **Client (Next.js):** http://localhost:3000  
- **Server (API):** http://localhost:4000  

The client container waits for the server to be healthy (via `/api/health`) before starting, so the backend is always up before the Next.js app runs.  

## Options

- **Detached (background):** `docker compose up -d --build`
- **Stop:** `docker compose down`
- **Stop and remove uploads volume:** `docker compose down -v`

## Environment

- **MONGODB_URI** (required) – Your MongoDB connection string (Atlas or self-hosted).
- **JWT_SECRET** (required in production) – Secret key for JWT auth cookies. Use a long random string. If Nginx (or similar) proxies `/api/*` to the backend, set JWT_SECRET only on the backend; the backend now reads the session from the `auth_session` cookie for media list and other APIs. If Next.js handles `/api` (no proxy to backend), set the same JWT_SECRET on both backend and Next.js so session verification works.
- Other defaults are in `docker-compose.yml`; override via `.env` or environment.

## First run

After the first start, you may need to seed the database. From the project root, run (with the stack up):

```bash
# Admin user
docker compose exec server node dist/scripts/seed-admin.js

# Refs (categories, etc.)
docker compose exec server node dist/scripts/seed-refs.js
```

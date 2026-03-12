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

## Options

- **Detached (background):** `docker compose up -d --build`
- **Stop:** `docker compose down`
- **Stop and remove uploads volume:** `docker compose down -v`

## Environment

- **MONGODB_URI** (required) – Your MongoDB connection string (Atlas or self-hosted).
- Other defaults are in `docker-compose.yml`; override via `.env` or environment.

## First run

After the first start, you may need to seed the database. From the project root, run (with the stack up):

```bash
# Admin user
docker compose exec server node dist/scripts/seed-admin.js

# Refs (categories, etc.)
docker compose exec server node dist/scripts/seed-refs.js
```

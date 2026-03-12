# 360Nepal API (TypeScript + Express + Mongoose)

Backend for the 360Nepal client.

## Setup

1. **Install dependencies**

   ```bash
   cd server && npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `PORT` – server port (default `4000`)
   - `MONGODB_URI` – MongoDB connection string (default `mongodb://127.0.0.1:27017/threesixtynepal`)
   - `CLIENT_ORIGIN` – allowed CORS origin for the client (e.g. `http://localhost:3000` or your client URL)

3. **Run MongoDB** (local or Atlas).

4. **Video compression (optional)**  
   Uploaded videos are compressed into medium and low variants using **FFmpeg**. Install FFmpeg on your system (e.g. `brew install ffmpeg` on macOS) for video processing. If FFmpeg is not available, only the original file is stored.

## Scripts

- `npm run dev` – start with hot reload (`ts-node-dev`)
- `npm run build` – compile TypeScript to `dist/`
- `npm start` – run compiled app (`node dist/index.js`)
- `npm run lint` – type-check only (`tsc --noEmit`)

## API

- `GET /api/health` – health check + DB status
- `GET /api/listings` – list active listings
- `GET /api/listings/:id` – get one listing
- `POST /api/listings` – create listing (body: `title`, `description`, `category`, `location`, `userId`, optional `images`)

Static client files are served from the `client` folder at the project root when hitting the server origin (e.g. `http://localhost:4000`). For a separate client dev server, set `CLIENT_ORIGIN` and call the API from the client using `http://localhost:4000/api/...`.

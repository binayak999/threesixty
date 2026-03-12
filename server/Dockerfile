# Build stage
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install ffmpeg for fluent-ffmpeg (and build deps for native modules if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production stage
FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# Create uploads dir for media
RUN mkdir -p uploads

EXPOSE 4000

CMD ["node", "dist/index.js"]

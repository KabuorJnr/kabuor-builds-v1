# Multi-stage Docker build for Kabuor Builds (Shop Platform)
FROM node:22-bookworm-slim AS build
WORKDIR /app

# Copy package manifests for workspace dependency resolution
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies across all workspaces
RUN npm ci

# Copy full repository source
COPY . .

# Build client React application
RUN npm run build -w client

# Remove development dependencies
RUN npm prune --omit=dev

# Production runtime stage
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production

# Copy root and workspace package manifests + production node_modules
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/client/package*.json ./client/
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/server ./server

# Ensure data directory exists for SQLite database and uploads
RUN mkdir -p server/data

EXPOSE 4000

CMD ["npm", "start", "-w", "server"]

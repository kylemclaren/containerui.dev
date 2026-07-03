# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.3.2
FROM oven/bun:${BUN_VERSION}-slim AS base

LABEL fly_launch_runtime="Bun"

# Bun app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage that produces the static site in /app/dist
FROM base AS build

# Install node modules (dev deps included — needed to build the site)
COPY bun.lock package.json ./
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Build the static site
RUN bun --bun run build


# Final stage: serve the static build with nginx
FROM nginx:alpine

# nginx listens on 8080 to match fly.toml's internal_port
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD [ "nginx", "-g", "daemon off;" ]

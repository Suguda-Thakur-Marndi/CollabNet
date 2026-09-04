# syntax=docker/dockerfile:1
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build-time environment variables
ARG VITE_SERVER_URL
ARG VITE_PISTON_API_URL

ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_PISTON_API_URL=$VITE_PISTON_API_URL

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

# Production web server stage
FROM nginx:1.27-alpine AS runner

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]

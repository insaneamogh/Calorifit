# Stage 1: Build Expo web
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build Expo web export
RUN npx expo export --platform web

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built web app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config and preview page
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY preview.html /usr/share/nginx/html/preview.html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

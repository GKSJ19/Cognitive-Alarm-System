# Step 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package dependency manifests
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy application source code
COPY . .

# Build Vite frontend and Express server output to dist/
RUN npm run build

# Step 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests and install production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy compiled build output from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Start compiled Express production server
CMD ["node", "dist/server.cjs"]
FROM node:22-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy workspace root files (package.json, pnpm-lock.yaml, pnpm-workspace.yaml)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all workspace package.json files to establish the workspace structure
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/
COPY packages/*/package.json ./packages/*/

# Change ownership and switch to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY --chown=nestjs:nodejs apps/backend ./apps/backend/

# Set working directory to backend app
WORKDIR /app/apps/backend

# Expose port
EXPOSE 8080

# Start the application using pnpm from the workspace root
CMD ["pnpm", "--filter", "backend", "run", "dev"]


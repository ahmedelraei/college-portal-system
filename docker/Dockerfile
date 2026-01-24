FROM node:22-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy workspace root files (package.json, pnpm-lock.yaml, pnpm-workspace.yaml)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy only package.json files to establish the workspace structure for dependency installation
# This allows Docker to cache the dependency installation layer separately from source code
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/utils/package.json ./packages/utils/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/ui/package.json ./packages/ui/

# Install all workspace dependencies
# This layer will be cached as long as package.json files don't change
RUN pnpm install

# Copy source code after dependency installation
# This ensures dependency cache is preserved when only source code changes
COPY apps/ ./apps/

# Copy packages
COPY packages/ ./packages/


COPY turbo.json ./turbo.json

# Expose ports
EXPOSE 8080
EXPOSE 3000

# Start the application using pnpm from the workspace root
CMD ["pnpm", "run", "dev"]
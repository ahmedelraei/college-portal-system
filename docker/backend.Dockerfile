FROM node:22-alpine as base

RUN npm install -g pnpm

# Install dependencies only when needed
FROM base as deps
RUN apk add -no-cache libc6-compat
WORKDIR /app

# Copy workspace files (from root)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/backend ./apps/backend

# Install all dependencies from root
RUN pnpm install --frozen-lockfile


# Rebuild the source code only when needed
FROM base as builder
WORKDIR /app

# Copy node_modules and source from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/backend ./apps/backend

# Build the backend app (if it has a build step)
RUN pnpm --filter backend build 2>/dev/null || echo "No build script found for backend"

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages
COPY --from=builder --chown=nodejs:nodejs /app/apps/backend ./apps/backend

USER nodejs

ENV PORT 8080
ENV HOSTNAME "0.0.0.0"

WORKDIR /app/apps/backend

EXPOSE 8080

CMD ["pnpm", "--filter", "backend", "run", "start:prod"]
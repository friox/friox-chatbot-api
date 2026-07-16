# Stage 1: Base
FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@10.20.0

WORKDIR /app

# Stage 2: Build Dependencies
FROM base AS build-deps
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Stage 3: Build
FROM base AS builder
COPY --from=build-deps /app/node_modules /app/node_modules
COPY . .
RUN pnpm build

# Stage 4: Prod Dependencies
FROM base AS prod-deps
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Stage 5: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN mkdir -p /app/data && chown -R node:node /app/data

USER node

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/drizzle /app/drizzle
COPY package.json ./

EXPOSE 3000

CMD ["sh", "-c", "node dist/common/tools/migrate.js && node dist/main.js"]

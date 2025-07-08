FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts

COPY . .

RUN npm run build

FROM node:22-alpine AS release

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts --omit=dev

ENTRYPOINT ["node", "dist/index.js"]
